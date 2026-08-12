import type { DocumentFile, DocumentJob, JobStatus } from "@/types";

/**
 * In-memory mock store standing in for PostgreSQL (spec section 12/13).
 * Module-scoped state is fine for local/dev mocking only — it does not
 * survive across serverless invocations or multiple instances.
 */
const jobs = new Map<string, DocumentJob>();
const files = new Map<string, DocumentFile>();

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
}

export function createJob(input: {
  toolSlug: string;
  ownerId: string | null;
  anonymousSessionId?: string;
  configuration?: Record<string, unknown>;
  inputFileIds: string[];
}): DocumentJob {
  const jobId = id("job");
  const now = new Date().toISOString();
  const job: DocumentJob = {
    id: jobId,
    ownerId: input.ownerId,
    anonymousSessionId: input.anonymousSessionId,
    toolSlug: input.toolSlug,
    status: "queued",
    configuration: input.configuration ?? {},
    progress: 0,
    createdAt: now,
    inputFiles: input.inputFileIds.map((fid) => files.get(fid)).filter(Boolean) as DocumentFile[],
    outputFiles: [],
  };
  jobs.set(jobId, job);
  return job;
}

export function getJob(jobId: string): DocumentJob | undefined {
  return jobs.get(jobId);
}

export function updateJob(jobId: string, patch: Partial<DocumentJob>): DocumentJob | undefined {
  const job = jobs.get(jobId);
  if (!job) return undefined;
  const updated = { ...job, ...patch };
  jobs.set(jobId, updated);
  return updated;
}

export function setJobProgress(jobId: string, progress: number, status: JobStatus): void {
  const job = jobs.get(jobId);
  if (!job) return;
  const patch: Partial<DocumentJob> = { progress, status };
  if (status === "completed") {
    patch.completedAt = new Date().toISOString();
    patch.outputFiles = [buildMockOutputFile(job)];
  }
  updateJob(jobId, patch);
}

function buildMockOutputFile(job: DocumentJob): DocumentFile {
  const input = job.inputFiles?.[0];
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    id: id("file"),
    ownerId: job.ownerId,
    jobId: job.id,
    role: "output",
    originalName: input ? `${input.originalName.replace(/\.[^.]+$/, "")}-result${input.originalName.match(/\.[^.]+$/)?.[0] ?? ""}` : "result.pdf",
    mimeType: input?.mimeType ?? "application/pdf",
    sizeBytes: input ? Math.round(input.sizeBytes * 0.62) : 0,
    storageKey: `mock/${job.id}/output`,
    sha256: id("sha"),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

export function registerFile(input: {
  ownerId: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}): DocumentFile {
  const fileId = id("file");
  const now = new Date();
  const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const file: DocumentFile = {
    id: fileId,
    ownerId: input.ownerId,
    jobId: "",
    role: "input",
    originalName: input.originalName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    storageKey: `mock/uploads/${fileId}`,
    sha256: id("sha"),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
  files.set(fileId, file);
  return file;
}

export function getFile(fileId: string): DocumentFile | undefined {
  return files.get(fileId);
}
