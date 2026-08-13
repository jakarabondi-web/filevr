import IORedis from "ioredis";

/** BullMQ rejects colons in queue names; it uses them as its own key separator. */
export const CONVERSION_QUEUE = "filevr-conversion";

/** Reused across hot reloads so dev does not exhaust Redis connections. */
const globalForRedis = globalThis as unknown as { __filevrRedis?: IORedis };

export function redisConnection(): IORedis {
  if (globalForRedis.__filevrRedis) return globalForRedis.__filevrRedis;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not set. Copy .env.example to .env.local and point it at Redis.");
  }

  const connection = new IORedis(url, {
    // BullMQ blocks on commands and requires retries to be unlimited.
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  if (process.env.NODE_ENV !== "production") globalForRedis.__filevrRedis = connection;
  return connection;
}

export interface ConversionJobData {
  jobId: string;
  toolSlug: string;
}
