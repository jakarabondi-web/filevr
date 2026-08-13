import { NextRequest, NextResponse } from "next/server";
import { getFile, markFileUploaded } from "@/lib/db/repository";
import { storage } from "@/lib/storage";
import { verifyUploadedBytes } from "@/lib/validation/verify-upload";

/**
 * Confirms an upload actually landed. Until this succeeds the file row is only
 * a reservation, and no job will accept it.
 *
 * TODO (Phase 5): stream to ClamAV instead of buffering, once files can exceed
 * worker memory.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const file = await getFile(fileId);
  if (!file) {
    return NextResponse.json({ errorCode: "NOT_FOUND" }, { status: 404 });
  }

  const driver = storage();
  const object = await driver.head(file.storageKey);
  if (!object) {
    return NextResponse.json(
      { errorCode: "BYTES_MISSING", errorMessage: "The upload didn't finish. Try again." },
      { status: 409 }
    );
  }

  const bytes = await driver.get(file.storageKey);
  const verified = await verifyUploadedBytes(bytes, {
    sizeBytes: file.sizeBytes,
    mimeType: file.mimeType,
  });

  if (!verified.ok) {
    // Reject the bytes rather than leaving unverified content in the bucket.
    await driver.delete(file.storageKey);
    return NextResponse.json(
      { errorCode: verified.errorCode, errorMessage: verified.errorMessage },
      { status: 422 }
    );
  }

  const updated = await markFileUploaded(fileId, {
    sizeBytes: verified.sizeBytes,
    sha256: verified.sha256,
    mimeType: verified.mimeType,
    pageCount: verified.pageCount,
  });

  return NextResponse.json({ file: updated, status: "uploaded" });
}
