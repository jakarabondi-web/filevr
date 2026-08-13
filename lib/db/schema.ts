import {
  bigint,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Job lifecycle. Mirrors the JobStatus union in @/types — the two must stay in
 * step, which the type assertions in lib/db/repository.ts enforce at compile
 * time.
 */
export const jobStatus = pgEnum("job_status", [
  "draft",
  "uploading",
  "uploaded",
  "configured",
  "queued",
  "processing",
  "completed",
  "upload_failed",
  "processing_failed",
  "expired",
  "deleted",
]);

export const fileRole = pgEnum("file_role", ["input", "output"]);

/**
 * Uploaded and generated files. Rows are created before the bytes exist: the
 * client gets a presigned URL, PUTs to storage, then calls the completion
 * endpoint, which is what sets `uploadedAt`, `sha256`, and the verified size.
 * A row without `uploadedAt` is a reservation, not a file.
 */
export const files = pgTable(
  "files",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id"),
    jobId: text("job_id"),
    role: fileRole("role").notNull().default("input"),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    /** Declared by the client at reservation; corrected on completion. */
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    storageKey: text("storage_key").notNull(),
    sha256: text("sha256"),
    pageCount: integer("page_count"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    /** Null until the bytes are verified in storage. */
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("files_storage_key_idx").on(t.storageKey),
    index("files_owner_idx").on(t.ownerId),
    index("files_job_idx").on(t.jobId),
    // Drives the retention sweeper that makes "auto-deleted" true.
    index("files_expiry_idx").on(t.expiresAt),
  ]
);

export const jobs = pgTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id"),
    anonymousSessionId: text("anonymous_session_id"),
    toolSlug: text("tool_slug").notNull(),
    status: jobStatus("status").notNull().default("queued"),
    configuration: jsonb("configuration").notNull().default({}),
    progress: integer("progress").notNull().default(0),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("jobs_owner_idx").on(t.ownerId), index("jobs_status_idx").on(t.status)]
);

/**
 * Which files feed which job. A separate table because a job can take many
 * inputs (merge) and `files.jobId` alone cannot express input ordering.
 */
export const jobInputs = pgTable(
  "job_inputs",
  {
    jobId: text("job_id").notNull(),
    fileId: text("file_id").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [uniqueIndex("job_inputs_pk").on(t.jobId, t.fileId), index("job_inputs_job_idx").on(t.jobId)]
);

/**
 * Idempotency keys for POST /api/jobs. Previously a module-scoped Map, which
 * meant a retried request created a duplicate job on any other instance.
 */
export const idempotencyKeys = pgTable("idempotency_keys", {
  key: text("key").primaryKey(),
  jobId: text("job_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
