import type { DocumentJob } from "@/types";

/**
 * DocumentProcessor is the seam between the job orchestration layer and a
 * specific conversion backend. Swap MockDocumentProcessor for a real
 * queue/worker-backed implementation without touching API routes.
 */
export interface DocumentProcessor {
  start(job: DocumentJob): Promise<void>;
  getProgress(jobId: string): Promise<{ progress: number; status: DocumentJob["status"] }>;
}

/** Fake progress adapter used until real workers are wired up (spec section 21, step 4). */
export class MockDocumentProcessor implements DocumentProcessor {
  private timers = new Map<string, ReturnType<typeof setInterval>>();

  constructor(
    private readonly onProgress: (
      jobId: string,
      progress: number,
      status: DocumentJob["status"]
    ) => void | Promise<void>
  ) {}

  async start(job: DocumentJob): Promise<void> {
    let progress = job.progress;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.round(8 + Math.random() * 12));
      if (progress >= 100) {
        clearInterval(timer);
        this.timers.delete(job.id);
        // Persisting the output is async; failures must not crash the timer.
        void Promise.resolve(this.onProgress(job.id, 100, "completed")).catch((err) =>
          console.error(`Job ${job.id} failed to finalize`, err)
        );
        return;
      }
      void Promise.resolve(this.onProgress(job.id, progress, "processing")).catch(() => {});
    }, 500);
    this.timers.set(job.id, timer);
  }

  async getProgress(_jobId: string) {
    return { progress: 100, status: "completed" as const };
  }
}
