import { and, asc, eq, isNull, lt } from "drizzle-orm";
import { randomBytes, randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";
import { files, idempotencyKeys, jobInputs, jobs } from "@/lib/db/schema";
import type { DocumentFile, DocumentJob, JobStatus } from "@/types";

/** Retention windows. Inputs are transient; outputs live long enough to download. */
export const INPUT_TTL_MS = 2 * 60 * 60 * 1000;
export const OUTPUT_TTL_MS = 24 * 60 * 60 * 1000;

function id(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

type FileRow = typeof files.$inferSelect;
type JobRow = typeof jobs.$inferSelect;

function toDocumentFile(row: FileRow): DocumentFile {
  return {
    id: row.id,
    ownerId: row.ownerId,
    jobId: row.jobId ?? "",
    role: row.role,
    originalName: row.originalName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    storageKey: row.storageKey,
    sha256: row.sha256 ?? "",
    pageCount: row.pageCount ?? undefined,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
  };
}

function toDocumentJob(row: JobRow, inputs: FileRow[], outputs: FileRow[]): DocumentJob {
  return {
    id: row.id,
    ownerId: row.ownerId,
    anonymousSessionId: row.anonymousSessionId ?? undefined,
    toolSlug: row.toolSlug,
    status: row.status,
    configuration: (row.configuration ?? {}) as Record<string, unknown>,
    progress: row.progress,
    errorCode: row.errorCode ?? undefined,
    errorMessage: row.errorMessage ?? undefined,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    inputFiles: inputs.map(toDocumentFile),
    outputFiles: outputs.map(toDocumentFile),
  };
}

// ————————————————————————— files —————————————————————————

/**
 * Reserve a row and a storage key before any bytes exist. The file is not
 * usable until completeUpload verifies it.
 */
export async function reserveFile(input: {
  ownerId: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<DocumentFile> {
  const fileId = id("file");
  // randomUUID keeps the key unguessable, so a leaked key is not a directory listing.
  const storageKey = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;

  const [row] = await db
    .insert(files)
    .values({
      id: fileId,
      ownerId: input.ownerId,
      role: "input",
      originalName: input.originalName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey,
      expiresAt: new Date(Date.now() + INPUT_TTL_MS),
    })
    .returning();

  return toDocumentFile(row);
}

export async function getFile(fileId: string): Promise<DocumentFile | undefined> {
  const [row] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, fileId), isNull(files.deletedAt)))
    .limit(1);
  return row ? toDocumentFile(row) : undefined;
}

/** Marks a reserved file as really present, with verified size and digest. */
export async function markFileUploaded(
  fileId: string,
  verified: { sizeBytes: number; sha256: string; mimeType: string; pageCount?: number }
): Promise<DocumentFile | undefined> {
  const [row] = await db
    .update(files)
    .set({
      sizeBytes: verified.sizeBytes,
      sha256: verified.sha256,
      mimeType: verified.mimeType,
      pageCount: verified.pageCount,
      uploadedAt: new Date(),
    })
    .where(eq(files.id, fileId))
    .returning();
  return row ? toDocumentFile(row) : undefined;
}

export async function isFileUploaded(fileId: string): Promise<boolean> {
  const [row] = await db.select({ uploadedAt: files.uploadedAt }).from(files).where(eq(files.id, fileId)).limit(1);
  return Boolean(row?.uploadedAt);
}

// ————————————————————————— jobs —————————————————————————

export async function createJob(input: {
  toolSlug: string;
  ownerId: string | null;
  anonymousSessionId?: string;
  configuration?: Record<string, unknown>;
  inputFileIds: string[];
}): Promise<DocumentJob> {
  const jobId = id("job");

  await db.transaction(async (tx) => {
    await tx.insert(jobs).values({
      id: jobId,
      ownerId: input.ownerId,
      anonymousSessionId: input.anonymousSessionId,
      toolSlug: input.toolSlug,
      status: "queued",
      configuration: input.configuration ?? {},
    });

    if (input.inputFileIds.length > 0) {
      await tx
        .insert(jobInputs)
        .values(input.inputFileIds.map((fileId, position) => ({ jobId, fileId, position })));
      // Associate the inputs with the job so retention can cascade.
      for (const fileId of input.inputFileIds) {
        await tx.update(files).set({ jobId }).where(eq(files.id, fileId));
      }
    }
  });

  const job = await getJob(jobId);
  if (!job) throw new Error(`Job ${jobId} vanished immediately after insert`);
  return job;
}

export async function getJob(jobId: string): Promise<DocumentJob | undefined> {
  const [row] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!row) return undefined;

  const inputs = await db
    .select({ file: files })
    .from(jobInputs)
    .innerJoin(files, eq(files.id, jobInputs.fileId))
    .where(eq(jobInputs.jobId, jobId))
    .orderBy(asc(jobInputs.position));

  const outputs = await db
    .select()
    .from(files)
    .where(and(eq(files.jobId, jobId), eq(files.role, "output"), isNull(files.deletedAt)));

  return toDocumentJob(
    row,
    inputs.map((r) => r.file),
    outputs
  );
}

export async function updateJob(
  jobId: string,
  patch: Partial<{
    status: JobStatus;
    progress: number;
    errorCode: string;
    errorMessage: string;
    startedAt: Date;
    completedAt: Date;
  }>
): Promise<DocumentJob | undefined> {
  const [row] = await db.update(jobs).set(patch).where(eq(jobs.id, jobId)).returning();
  return row ? getJob(jobId) : undefined;
}

/** Records a produced file against a job. Called by the processor. */
export async function addJobOutput(
  jobId: string,
  output: {
    ownerId: string | null;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    sha256: string;
    pageCount?: number;
  }
): Promise<DocumentFile> {
  const [row] = await db
    .insert(files)
    .values({
      id: id("file"),
      jobId,
      role: "output",
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + OUTPUT_TTL_MS),
      ...output,
    })
    .returning();
  return toDocumentFile(row);
}

// ——————————————————— idempotency & retention ———————————————————

/** Returns the job id a key already produced, if any. */
export async function lookupIdempotencyKey(key: string): Promise<string | undefined> {
  const [row] = await db
    .select({ jobId: idempotencyKeys.jobId })
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.key, key))
    .limit(1);
  return row?.jobId;
}

export async function recordIdempotencyKey(key: string, jobId: string): Promise<void> {
  await db.insert(idempotencyKeys).values({ key, jobId }).onConflictDoNothing();
}

/**
 * Files whose retention window has passed. The sweeper deletes the bytes, then
 * calls markFilesDeleted. Kept here so retention is a query, not a guess.
 */
export async function findExpiredFiles(limit = 500): Promise<DocumentFile[]> {
  const rows = await db
    .select()
    .from(files)
    .where(and(lt(files.expiresAt, new Date()), isNull(files.deletedAt)))
    .limit(limit);
  return rows.map(toDocumentFile);
}

export async function markFilesDeleted(fileIds: string[]): Promise<void> {
  if (fileIds.length === 0) return;
  const now = new Date();
  for (const fileId of fileIds) {
    await db.update(files).set({ deletedAt: now }).where(eq(files.id, fileId));
  }
}
