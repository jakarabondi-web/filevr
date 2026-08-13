import { LocalStorageDriver } from "@/lib/storage/local-driver";
import { S3StorageDriver } from "@/lib/storage/s3-driver";
import type { SignedUploadTarget, StorageDriver } from "@/lib/storage/driver";

export type { SignedUploadTarget, StorageDriver, StoredObject } from "@/lib/storage/driver";

let cached: StorageDriver | undefined;

/**
 * Resolves the driver from STORAGE_DRIVER. Defaults to `local` so a fresh
 * checkout runs without cloud credentials; production sets it to `s3`.
 */
export function storage(): StorageDriver {
  if (cached) return cached;
  const driver = (process.env.STORAGE_DRIVER ?? "local").toLowerCase();
  cached = driver === "s3" ? S3StorageDriver.fromEnv() : LocalStorageDriver.fromEnv();
  return cached;
}

/** Test seam: lets a suite swap in a fake without touching the environment. */
export function __setStorageForTests(driver: StorageDriver | undefined) {
  cached = driver;
}

export async function createSignedUploadUrl(
  storageKey: string,
  contentType: string
): Promise<SignedUploadTarget> {
  return storage().createUploadUrl(storageKey, contentType);
}

export async function createSignedDownloadUrl(
  storageKey: string,
  filename: string
): Promise<string> {
  return storage().createDownloadUrl(storageKey, { filename });
}
