export type JobStatus =
  | "draft"
  | "uploading"
  | "uploaded"
  | "configured"
  | "queued"
  | "processing"
  | "completed"
  | "upload_failed"
  | "processing_failed"
  | "expired"
  | "deleted";

export interface DocumentFile {
  id: string;
  ownerId: string | null;
  jobId: string;
  role: "input" | "output";
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  sha256: string;
  pageCount?: number;
  createdAt: string;
  expiresAt: string;
}

export interface DocumentJob {
  id: string;
  ownerId: string | null;
  anonymousSessionId?: string;
  toolSlug: string;
  status: JobStatus;
  configuration: Record<string, unknown>;
  progress: number;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  inputFiles?: DocumentFile[];
  outputFiles?: DocumentFile[];
}

export type ToolCategory =
  | "Convert"
  | "Edit"
  | "Organize"
  | "Sign & Fill"
  | "Secure"
  | "AI & OCR";

export interface ToolDefinition {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: ToolCategory;
  acceptedMimeTypes: string[];
  acceptedExtensions: string[];
  icon: string;
  accent: "lime" | "indigo" | "coral" | "sky";
  multiFile: boolean;
}

export type QueuedFileStatus =
  | "pending"
  | "uploading"
  | "uploaded"
  | "error";

export interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  mimeType: string;
  status: QueuedFileStatus;
  progress: number;
  errorCode?: string;
  errorMessage?: string;
}
