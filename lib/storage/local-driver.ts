import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import {
  DEFAULT_DOWNLOAD_TTL_SECONDS,
  DEFAULT_UPLOAD_TTL_SECONDS,
  type SignedUploadTarget,
  type StorageDriver,
  type StoredObject,
} from "@/lib/storage/driver";

/**
 * Filesystem-backed driver for development. It mimics the parts of S3 that
 * matter here: the browser receives a URL with an expiry and a signature and
 * PUTs bytes to it, and the app can only read what was actually written.
 */
export class LocalStorageDriver implements StorageDriver {
  readonly name = "local" as const;
  private readonly root: string;
  private readonly secret: string;

  constructor(rootDir: string, signingSecret: string) {
    this.root = resolve(process.cwd(), rootDir);
    this.secret = signingSecret;
  }

  /** Guards against `..` in a key escaping the storage root. */
  private pathFor(key: string): string {
    const full = resolve(this.root, key);
    if (full !== this.root && !full.startsWith(this.root + sep)) {
      throw new Error("Storage key escapes the storage root");
    }
    return full;
  }

  sign(key: string, expiresAt: number, op: "put" | "get"): string {
    return createHmac("sha256", this.secret).update(`${op}:${key}:${expiresAt}`).digest("hex");
  }

  /** Constant-time check; also rejects anything past its expiry. */
  verify(key: string, expiresAt: number, op: "put" | "get", signature: string): boolean {
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
    const expected = Buffer.from(this.sign(key, expiresAt, op));
    const given = Buffer.from(signature);
    return expected.length === given.length && timingSafeEqual(expected, given);
  }

  async createUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = DEFAULT_UPLOAD_TTL_SECONDS
  ): Promise<SignedUploadTarget> {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const params = new URLSearchParams({
      key,
      expires: String(expiresAt),
      signature: this.sign(key, expiresAt, "put"),
    });
    return {
      uploadUrl: `/api/storage/upload?${params}`,
      method: "PUT",
      requiredHeaders: { "content-type": contentType },
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  async createDownloadUrl(
    key: string,
    { filename, expiresInSeconds = DEFAULT_DOWNLOAD_TTL_SECONDS }: { filename: string; expiresInSeconds?: number }
  ): Promise<string> {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const params = new URLSearchParams({
      key,
      expires: String(expiresAt),
      signature: this.sign(key, expiresAt, "get"),
      filename,
    });
    return `/api/storage/download?${params}`;
  }

  async head(key: string): Promise<StoredObject | null> {
    try {
      const info = await stat(this.pathFor(key));
      return { sizeBytes: info.size };
    } catch {
      return null;
    }
  }

  async get(key: string): Promise<Buffer> {
    return readFile(this.pathFor(key));
  }

  async put(key: string, body: Buffer, _contentType: string): Promise<void> {
    const target = this.pathFor(key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, body);
  }

  async delete(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true });
  }

  /** Used by the dev storage routes, which need the same root and secret. */
  static fromEnv(): LocalStorageDriver {
    const dir = process.env.STORAGE_LOCAL_DIR ?? ".filevr-storage";
    const secret = process.env.STORAGE_SIGNING_SECRET;
    if (!secret) {
      throw new Error("STORAGE_SIGNING_SECRET is required when STORAGE_DRIVER=local");
    }
    return new LocalStorageDriver(dir, secret);
  }
}

export const localStoragePath = (rootDir: string, key: string) => join(resolve(process.cwd(), rootDir), key);
