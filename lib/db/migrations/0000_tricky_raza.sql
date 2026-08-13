CREATE TYPE "public"."file_role" AS ENUM('input', 'output');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'uploading', 'uploaded', 'configured', 'queued', 'processing', 'completed', 'upload_failed', 'processing_failed', 'expired', 'deleted');--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text,
	"job_id" text,
	"role" "file_role" DEFAULT 'input' NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"storage_key" text NOT NULL,
	"sha256" text,
	"page_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uploaded_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"key" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_inputs" (
	"job_id" text NOT NULL,
	"file_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text,
	"anonymous_session_id" text,
	"tool_slug" text NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"error_code" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "files_storage_key_idx" ON "files" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "files_owner_idx" ON "files" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "files_job_idx" ON "files" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "files_expiry_idx" ON "files" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "job_inputs_pk" ON "job_inputs" USING btree ("job_id","file_id");--> statement-breakpoint
CREATE INDEX "job_inputs_job_idx" ON "job_inputs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "jobs_owner_idx" ON "jobs" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");