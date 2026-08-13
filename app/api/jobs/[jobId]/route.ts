import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/db/repository";
import { createSignedDownloadUrl } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ errorCode: "NOT_FOUND" }, { status: 404 });
  }

  // Download URLs are minted per request so they expire shortly after being seen.
  const outputs = await Promise.all(
    (job.outputFiles ?? []).map(async (f) => ({
      id: f.id,
      name: f.originalName,
      sizeBytes: f.sizeBytes,
      expiresAt: f.expiresAt,
      downloadUrl: await createSignedDownloadUrl(f.storageKey, f.originalName),
    }))
  );

  return NextResponse.json({
    id: job.id,
    toolSlug: job.toolSlug,
    status: job.status,
    progress: job.progress,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    outputs,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ errorCode: "NOT_FOUND" }, { status: 404 });
  }
  await updateJob(jobId, { status: "deleted" });
  return new NextResponse(null, { status: 204 });
}
