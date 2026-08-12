import type { RecentFile } from "@/components/files/recent-files-panel";

export const MOCK_RECENT_FILES: RecentFile[] = [
  { id: "job_1", name: "Proposal.pdf", status: "completed", sizeBytes: 842_000, updatedAt: "2026-08-11T14:20:00Z" },
  { id: "job_2", name: "Contract.docx", status: "processing", sizeBytes: 1_240_000, updatedAt: "2026-08-12T09:05:00Z" },
  { id: "job_3", name: "Invoice scan", status: "processing_failed", sizeBytes: 3_450_000, updatedAt: "2026-08-10T18:44:00Z" },
  { id: "job_4", name: "Quarterly-report.pdf", status: "completed", sizeBytes: 5_120_000, updatedAt: "2026-08-09T11:00:00Z" },
];
