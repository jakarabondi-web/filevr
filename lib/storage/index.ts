/**
 * Object storage adapter seam (spec section 12): direct-to-storage signed
 * uploads/downloads. Swap for an S3-compatible implementation; the API
 * routes only depend on this interface.
 */
export interface SignedUploadTarget {
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

/** TODO: replace with real signed URL issuance (S3/R2/GCS). Never proxy large bodies through Next.js. */
export async function createSignedUploadUrl(storageKey: string): Promise<SignedUploadTarget> {
  return {
    uploadUrl: `/api/uploads/mock-put?key=${encodeURIComponent(storageKey)}`,
    requiredHeaders: { "content-type": "application/octet-stream" },
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

export async function createSignedDownloadUrl(storageKey: string): Promise<string> {
  return `/api/downloads/mock-get?key=${encodeURIComponent(storageKey)}`;
}
