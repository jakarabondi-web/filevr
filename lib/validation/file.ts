import { FREE_LIMITS, SUPPORTED_MIME_TYPES } from "@/config/tools";

export type FileErrorCode =
  | "UNSUPPORTED_TYPE"
  | "FILE_TOO_LARGE"
  | "TASK_LIMIT_EXCEEDED"
  | "TOTAL_SIZE_EXCEEDED"
  | "PASSWORD_PROTECTED"
  | "CORRUPT_FILE";

export const FILE_ERROR_COPY: Record<FileErrorCode, string> = {
  UNSUPPORTED_TYPE:
    "We can't process this file type yet. Try PDF, Word, Excel, PowerPoint, JPG, PNG, HEIC, or TXT.",
  FILE_TOO_LARGE:
    "This file is over the 100 MB Free limit. Choose a smaller file or upgrade to Pro.",
  TASK_LIMIT_EXCEEDED: `You can add up to ${FREE_LIMITS.filesPerTask} files per task on the Free plan.`,
  TOTAL_SIZE_EXCEEDED:
    "These files add up to more than the 500 MB Free limit for one task. Remove a few, or upgrade to Pro.",
  PASSWORD_PROTECTED: "This PDF is locked. Remove the password, then upload it again.",
  CORRUPT_FILE: "This file looks damaged and can't be opened. Try re-exporting it.",
};

export interface FileValidationResult {
  valid: boolean;
  errorCode?: FileErrorCode;
  errorMessage?: string;
}

export function validateFile(file: { name: string; type: string; size: number }): FileValidationResult {
  const isSupportedType =
    SUPPORTED_MIME_TYPES.includes(file.type) ||
    /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|heic|txt)$/i.test(file.name);

  if (!isSupportedType) {
    return { valid: false, errorCode: "UNSUPPORTED_TYPE", errorMessage: FILE_ERROR_COPY.UNSUPPORTED_TYPE };
  }

  if (file.size > FREE_LIMITS.maxFileSizeBytes) {
    return { valid: false, errorCode: "FILE_TOO_LARGE", errorMessage: FILE_ERROR_COPY.FILE_TOO_LARGE };
  }

  return { valid: true };
}

/**
 * Task-level limits: how many files one task may hold, and their combined size.
 * `existingBytes` defaults to 0 so older callers that only tracked count still
 * get the file-count check.
 */
export function validateQueue(
  existingCount: number,
  newFiles: { size: number }[],
  existingBytes = 0
): FileValidationResult {
  if (existingCount + newFiles.length > FREE_LIMITS.filesPerTask) {
    return {
      valid: false,
      errorCode: "TASK_LIMIT_EXCEEDED",
      errorMessage: FILE_ERROR_COPY.TASK_LIMIT_EXCEEDED,
    };
  }

  const incomingBytes = newFiles.reduce((sum, f) => sum + f.size, 0);
  if (existingBytes + incomingBytes > FREE_LIMITS.maxTotalSizeBytes) {
    return {
      valid: false,
      errorCode: "TOTAL_SIZE_EXCEEDED",
      errorMessage: FILE_ERROR_COPY.TOTAL_SIZE_EXCEEDED,
    };
  }

  return { valid: true };
}
