import { NextRequest, NextResponse } from "next/server";
import { validateFile } from "@/lib/validation/file";
import { createSignedUploadUrl } from "@/lib/storage";
import { registerFile } from "@/lib/jobs/store";
import { getSessionUser } from "@/lib/auth";

interface UploadRequestBody {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<UploadRequestBody>;

  if (!body.filename || !body.mimeType || typeof body.sizeBytes !== "number") {
    return NextResponse.json({ errorCode: "INVALID_REQUEST" }, { status: 400 });
  }

  const validation = validateFile({ name: body.filename, type: body.mimeType, size: body.sizeBytes });
  if (!validation.valid) {
    return NextResponse.json(
      { errorCode: validation.errorCode, errorMessage: validation.errorMessage },
      { status: 422 }
    );
  }

  const user = await getSessionUser();
  const file = registerFile({
    ownerId: user?.id ?? null,
    originalName: body.filename,
    mimeType: body.mimeType,
    sizeBytes: body.sizeBytes,
  });

  const target = await createSignedUploadUrl(file.storageKey);

  return NextResponse.json({
    fileId: file.id,
    uploadUrl: target.uploadUrl,
    requiredHeaders: target.requiredHeaders,
    expiresAt: target.expiresAt,
  });
}
