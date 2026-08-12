import { MockDocumentProcessor } from "@/lib/jobs/processor";
import { setJobProgress } from "@/lib/jobs/store";

export const mockProcessor = new MockDocumentProcessor((jobId, progress, status) => {
  setJobProgress(jobId, progress, status);
});
