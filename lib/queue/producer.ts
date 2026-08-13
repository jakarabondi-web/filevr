import { Queue } from "bullmq";
import { CONVERSION_QUEUE, redisConnection, type ConversionJobData } from "@/lib/queue/connection";

let queue: Queue<ConversionJobData> | undefined;

export function conversionQueue(): Queue<ConversionJobData> {
  if (!queue) {
    queue = new Queue<ConversionJobData>(CONVERSION_QUEUE, {
      connection: redisConnection(),
      defaultJobOptions: {
        attempts: 3,
        // Transient faults (a restarting worker, a blip reaching storage)
        // usually clear quickly; permanent input problems fail without retry
        // because the engine marks them non-retryable.
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 3600, count: 1000 },
        // Keep failures long enough to inspect them.
        removeOnFail: { age: 24 * 3600 },
      },
    });
  }
  return queue;
}

/**
 * Enqueues a job for processing. The job id doubles as the BullMQ job id, so
 * an accidental double-enqueue of the same job is dropped by Redis rather than
 * processed twice.
 */
export async function enqueueConversion(data: ConversionJobData): Promise<void> {
  await conversionQueue().add("convert", data, { jobId: data.jobId });
}
