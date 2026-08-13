import { MockDocumentProcessor } from "@/lib/jobs/processor";
import { addJobOutput, getJob, updateJob } from "@/lib/db/repository";
import { storage } from "@/lib/storage";
import { createHash, randomUUID } from "node:crypto";

/**
 * Bridges the mock processor to real persistence and real storage. It still
 * fakes the *transformation* — Phase 3 replaces it with a queue worker running
 * actual engines — but the job row, the output object, and the download are
 * now genuine, so the surrounding plumbing is exercised end to end.
 */
export const mockProcessor = new MockDocumentProcessor(async (jobId, progress, status) => {
  if (status !== "completed") {
    await updateJob(jobId, { progress, status });
    return;
  }

  const job = await getJob(jobId);
  if (!job) return;

  // Only write an output once, even if progress reports completion twice.
  if ((job.outputFiles?.length ?? 0) > 0) {
    await updateJob(jobId, { progress: 100, status: "completed", completedAt: new Date() });
    return;
  }

  const input = job.inputFiles?.[0];
  const driver = storage();

  let body: Buffer;
  let name = "result.pdf";
  let mimeType = "application/pdf";

  if (input) {
    // Pass the input bytes through unchanged: nothing is converted yet, and a
    // real file is more honest than a placeholder the user cannot open.
    body = await driver.get(input.storageKey);
    mimeType = input.mimeType;
    const ext = input.originalName.match(/\.[^.]+$/)?.[0] ?? "";
    name = `${input.originalName.replace(/\.[^.]+$/, "")}-${job.toolSlug}${ext}`;
  } else {
    body = Buffer.from("");
  }

  const storageKey = `outputs/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;
  await driver.put(storageKey, body, mimeType);

  await addJobOutput(jobId, {
    ownerId: job.ownerId,
    originalName: name,
    mimeType,
    sizeBytes: body.byteLength,
    storageKey,
    sha256: createHash("sha256").update(body).digest("hex"),
  });

  await updateJob(jobId, { progress: 100, status: "completed", completedAt: new Date() });
});
