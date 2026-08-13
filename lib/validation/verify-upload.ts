import { createHash } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { FREE_LIMITS, SUPPORTED_MIME_TYPES } from "@/config/tools";

export type VerificationErrorCode =
  | "BYTES_MISSING"
  | "SIZE_MISMATCH"
  | "FILE_TOO_LARGE"
  | "TYPE_MISMATCH"
  | "UNSUPPORTED_TYPE";

export interface VerificationFailure {
  ok: false;
  errorCode: VerificationErrorCode;
  errorMessage: string;
}

export interface VerificationSuccess {
  ok: true;
  sizeBytes: number;
  sha256: string;
  /** The type detected from the bytes, which may differ from what was declared. */
  mimeType: string;
  pageCount?: number;
}

export type VerificationResult = VerificationSuccess | VerificationFailure;

/** Text formats carry no magic bytes, so detection legitimately returns nothing. */
const MAGICLESS_TYPES = new Set(["text/plain", "text/csv"]);

/** Detected type → the declared types we accept for it. */
const EQUIVALENT: Record<string, string[]> = {
  "application/pdf": ["application/pdf"],
  "image/jpeg": ["image/jpeg", "image/jpg"],
  "image/png": ["image/png"],
  "image/heic": ["image/heic", "image/heif"],
  "application/zip": [
    // OOXML files are ZIP containers; some detectors report the container.
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
};

/**
 * Text formats have no signature to check, so "undetectable" cannot by itself
 * mean "accept" — that would let any binary through as text/plain. Require the
 * bytes to actually decode as UTF-8 text with no NULs or stray control codes.
 */
function looksLikeText(buffer: Buffer): boolean {
  if (buffer.includes(0)) return false;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    // Allow tab, newline, carriage return; reject other C0 controls.
    return !/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/.test(text);
  } catch {
    return false;
  }
}

/** Counts `/Type /Page` objects. Cheap and good enough for quota metering. */
function countPdfPages(buffer: Buffer): number | undefined {
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g);
  return matches?.length || undefined;
}

/**
 * Checks bytes that are already in storage against what the client claimed.
 * A client can declare anything at reservation time; this is where the server
 * decides what the file actually is.
 */
export async function verifyUploadedBytes(
  buffer: Buffer,
  declared: { sizeBytes: number; mimeType: string }
): Promise<VerificationResult> {
  if (buffer.byteLength === 0) {
    return {
      ok: false,
      errorCode: "BYTES_MISSING",
      errorMessage: "The upload didn't finish. Try again.",
    };
  }

  if (buffer.byteLength !== declared.sizeBytes) {
    return {
      ok: false,
      errorCode: "SIZE_MISMATCH",
      errorMessage: "The uploaded file didn't match what we expected. Try again.",
    };
  }

  if (buffer.byteLength > FREE_LIMITS.maxFileSizeBytes) {
    return {
      ok: false,
      errorCode: "FILE_TOO_LARGE",
      errorMessage: "This file is over the 100 MB Free limit. Choose a smaller file or upgrade to Pro.",
    };
  }

  const detected = await fileTypeFromBuffer(buffer);
  const detectedMime = detected?.mime;

  if (!detectedMime) {
    // No signature: only acceptable for formats that genuinely have none.
    if (!MAGICLESS_TYPES.has(declared.mimeType)) {
      return {
        ok: false,
        errorCode: "UNSUPPORTED_TYPE",
        errorMessage: "We couldn't read this file. Try re-exporting it.",
      };
    }
    if (!looksLikeText(buffer)) {
      return {
        ok: false,
        errorCode: "TYPE_MISMATCH",
        errorMessage: "This file isn't the type it claims to be. Upload it again.",
      };
    }
    return { ok: true, sizeBytes: buffer.byteLength, sha256: sha256(buffer), mimeType: declared.mimeType };
  }

  const accepted = EQUIVALENT[detectedMime] ?? [detectedMime];
  if (!accepted.includes(declared.mimeType)) {
    return {
      ok: false,
      errorCode: "TYPE_MISMATCH",
      errorMessage: "This file isn't the type it claims to be. Upload it again.",
    };
  }

  // Trust the declared type when it is a more specific form of what was detected
  // (a .docx detected as application/zip), otherwise trust the bytes.
  const resolved = accepted.length > 1 ? declared.mimeType : detectedMime;

  if (!SUPPORTED_MIME_TYPES.includes(resolved) && !MAGICLESS_TYPES.has(resolved)) {
    return {
      ok: false,
      errorCode: "UNSUPPORTED_TYPE",
      errorMessage: "We can't process this file type yet.",
    };
  }

  return {
    ok: true,
    sizeBytes: buffer.byteLength,
    sha256: sha256(buffer),
    mimeType: resolved,
    pageCount: resolved === "application/pdf" ? countPdfPages(buffer) : undefined,
  };
}

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}
