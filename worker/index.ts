/**
 * Conversion worker. Runs as its own long-lived process, never in a serverless
 * function: the engines are large native binaries, the work is CPU-bound, and
 * jobs routinely outlast function timeouts.
 *
 *   npm run worker
 *
 * Environment is loaded by Node's --env-file-if-exists flags in that script,
 * not by an import here: static imports hoist above any in-file loader call,
 * so the database client would read an empty environment.
 *
 * It is the only component that touches file contents. It leases a job, pulls
 * inputs from storage into a scratch directory, runs the engine, writes the
 * output back, and records the result. The scratch directory is always removed.
 */
import { Worker, type Job } from "bullmq";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONVERSION_QUEUE, redisConnection, type ConversionJobData } from "@/lib/queue/connection";
import { addJobOutput, getJob, updateJob, updateJobProgress } from "@/lib/db/repository";
import { storage } from "@/lib/storage";
import { getEngine, EngineError, type EngineInput } from "@/lib/engines";

/** Ceiling for a single job. Beyond this a file is pathological, not slow. */
const JOB_TIMEOUT_MS = Number(process.env.WORKER_JOB_TIMEOUT_MS ?? 120_000);
const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 2);

/**
 * Progress writes are throttled: the queue moves faster than a UI can read.
 * `stop()` is called before the terminal update so no further writes are even
 * attempted; updateJobProgress additionally refuses to touch a finished job,
 * which covers a write already in flight.
 */
function throttledProgress(jobId: string) {
  let last = 0;
  let stopped = false;
  const report = (percent: number) => {
    if (stopped) return;
    const clamped = Math.max(0, Math.min(99, Math.round(percent)));
    if (clamped - last < 5) return;
    last = clamped;
    void updateJobProgress(jobId, clamped).catch(() => {});
  };
  report.stop = () => {
    stopped = true;
  };
  return report;
}

async function processJob(job: Job<ConversionJobData>): Promise<void> {
  const { jobId } = job.data;
  const record = await getJob(jobId);
  if (!record) throw new Error(`Job ${jobId} not found`);

  // A job cancelled while queued must not be processed.
  if (record.status === "deleted" || record.status === "expired") {
    console.log(`[worker] skipping ${jobId} (${record.status})`);
    return;
  }

  const driver = storage();
  const workDir = await mkdtemp(join(tmpdir(), `filevr-${jobId}-`));
  const onProgress = throttledProgress(jobId);

  try {
    await updateJob(jobId, { status: "processing", progress: 1, startedAt: new Date() });

    const inputs: EngineInput[] = [];
    for (const [i, file] of (record.inputFiles ?? []).entries()) {
      const bytes = await driver.get(file.storageKey);
      const path = join(workDir, `input-${i}-${file.originalName.replace(/[^\w.-]/g, "_")}`);
      await writeFile(path, bytes);
      inputs.push({
        path,
        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
      });
    }

    if (inputs.length === 0) throw new EngineError("This job has no input files.", "NO_INPUTS", false);

    const engine = getEngine(record.toolSlug);
    let outputs;

    if (engine) {
      if (inputs.length < engine.minInputs) {
        throw new EngineError(
          `${record.toolSlug} needs at least ${engine.minInputs} files.`,
          "TOO_FEW_INPUTS",
          false
        );
      }
      outputs = await engine.run(inputs.slice(0, engine.maxInputs), {
        workDir,
        configuration: record.configuration,
        onProgress,
        timeoutMs: JOB_TIMEOUT_MS,
      });
    } else {
      // No engine yet for this tool: pass the input through unchanged rather
      // than fabricating a result. Phases 3–4 fill these in.
      console.warn(`[worker] no engine for ${record.toolSlug}; passing input through`);
      onProgress(50);
      outputs = [
        {
          path: inputs[0].path,
          filename: inputs[0].originalName,
          mimeType: inputs[0].mimeType,
        },
      ];
    }

    for (const output of outputs) {
      const bytes = await readFile(output.path);
      const storageKey = `outputs/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;
      await driver.put(storageKey, bytes, output.mimeType);
      await addJobOutput(jobId, {
        ownerId: record.ownerId,
        originalName: output.filename,
        mimeType: output.mimeType,
        sizeBytes: bytes.byteLength,
        storageKey,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      });
    }

    onProgress.stop();
    await updateJob(jobId, { status: "completed", progress: 100, completedAt: new Date() });
    console.log(`[worker] completed ${jobId} (${record.toolSlug})`);
  } catch (err) {
    onProgress.stop();
    const isEngineError = err instanceof EngineError;
    const retryable = isEngineError ? err.retryable : true;
    const attemptsLeft = (job.opts.attempts ?? 1) - job.attemptsMade - 1;

    // Only mark the job failed once retries are exhausted, so the UI does not
    // flash an error that a retry is about to clear.
    if (!retryable || attemptsLeft <= 0) {
      await updateJob(jobId, {
        status: "processing_failed",
        errorCode: isEngineError ? err.code : "INTERNAL_ERROR",
        errorMessage: isEngineError
          ? err.message
          : "Something went wrong on our side. Try again in a moment.",
      });
    }

    console.error(`[worker] job ${jobId} failed:`, err instanceof Error ? err.message : err);
    // Rethrow only when a retry could plausibly help.
    if (retryable && attemptsLeft > 0) throw err;
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

const worker = new Worker<ConversionJobData>(CONVERSION_QUEUE, processJob, {
  connection: redisConnection(),
  concurrency: CONCURRENCY,
  // Belt and braces: BullMQ reclaims the job if the process dies mid-run.
  lockDuration: JOB_TIMEOUT_MS + 30_000,
});

worker.on("failed", (job, err) => {
  console.error(`[worker] ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
});
worker.on("error", (err) => console.error("[worker] error:", err.message));

console.log(`[worker] listening on ${CONVERSION_QUEUE} (concurrency ${CONCURRENCY})`);

async function shutdown(signal: string) {
  console.log(`[worker] ${signal} received, finishing in-flight jobs`);
  await worker.close();
  process.exit(0);
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
