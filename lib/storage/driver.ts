/**
 * Object storage seam. Two drivers implement it: `s3` for real deployments and
 * `local` for development, which stores bytes on disk behind HMAC-signed URLs
 * so the whole upload path is exercised without an AWS account.
 *
 * Large bodies must never be proxied through Next.js — both drivers hand the
 * browser a URL it PUTs to directly.
 */
export interface SignedUploadTarget {
  uploadUrl: string;
  method: "PUT";
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface StoredObject {
  sizeBytes: number;
  contentType?: string;
}

export interface StorageDriver {
  readonly name: "s3" | "local";
  createUploadUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<SignedUploadTarget>;
  createDownloadUrl(
    key: string,
    options: { filename: string; expiresInSeconds?: number }
  ): Promise<string>;
  /** Object metadata, or null when the key holds no bytes yet. */
  head(key: string): Promise<StoredObject | null>;
  get(key: string): Promise<Buffer>;
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export const DEFAULT_UPLOAD_TTL_SECONDS = 15 * 60;
export const DEFAULT_DOWNLOAD_TTL_SECONDS = 5 * 60;
