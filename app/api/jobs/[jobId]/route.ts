import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json({ errorCode: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    toolSlug: job.toolSlug,
    status: job.status,
    progress: job.progress,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    outputs: job.outputFiles?.map((f) => ({
      id: f.id,
      name: f.originalName,
      sizeBytes: f.sizeBytes,
      expiresAt: f.expiresAt,
    })),
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json({ errorCode: "NOT_FOUND" }, { status: 404 });
  }
  updateJob(jobId, { status: "deleted" });
  return new NextResponse(null, { status: 204 });
}
