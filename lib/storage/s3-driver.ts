import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  DEFAULT_DOWNLOAD_TTL_SECONDS,
  DEFAULT_UPLOAD_TTL_SECONDS,
  type SignedUploadTarget,
  type StorageDriver,
  type StoredObject,
} from "@/lib/storage/driver";

/** Production driver. Works against S3 or any S3-compatible endpoint (R2, MinIO). */
export class S3StorageDriver implements StorageDriver {
  readonly name = "s3" as const;

  constructor(
    private readonly client: S3Client,
    private readonly bucket: string
  ) {}

  async createUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = DEFAULT_UPLOAD_TTL_SECONDS
  ): Promise<SignedUploadTarget> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      // Encryption at rest is one of the three promises the privacy rail makes.
      ServerSideEncryption: "AES256",
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    return {
      uploadUrl,
      method: "PUT",
      requiredHeaders: { "content-type": contentType },
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    };
  }

  async createDownloadUrl(
    key: string,
    { filename, expiresInSeconds = DEFAULT_DOWNLOAD_TTL_SECONDS }: { filename: string; expiresInSeconds?: number }
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      // Force a download with the original name rather than an opaque key.
      ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, "")}"`,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async head(key: string): Promise<StoredObject | null> {
    try {
      const res = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return { sizeBytes: res.ContentLength ?? 0, contentType: res.ContentType };
    } catch {
      return null;
    }
  }

  async get(key: string): Promise<Buffer> {
    const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) throw new Error(`Object ${key} has no body`);
    return Buffer.from(bytes);
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: "AES256",
      })
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  static fromEnv(): S3StorageDriver {
    const bucket = process.env.STORAGE_BUCKET;
    if (!bucket) throw new Error("STORAGE_BUCKET is required when STORAGE_DRIVER=s3");

    const client = new S3Client({
      region: process.env.STORAGE_REGION ?? "us-east-1",
      // Set for R2/MinIO; omit for AWS.
      endpoint: process.env.STORAGE_ENDPOINT || undefined,
      forcePathStyle: Boolean(process.env.STORAGE_ENDPOINT),
      credentials:
        process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
              secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
            }
          : undefined,
    });

    return new S3StorageDriver(client, bucket);
  }
}
