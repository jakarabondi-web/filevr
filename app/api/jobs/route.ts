import { NextRequest, NextResponse } from "next/server";
import {
  createJob,
  isFileUploaded,
  lookupIdempotencyKey,
  recordIdempotencyKey,
  updateJob,
} from "@/lib/db/repository";
import { mockProcessor } from "@/lib/jobs/mock-processor-instance";
import { getToolBySlug } from "@/config/tools";
import { getSessionUser } from "@/lib/auth";

interface CreateJobBody {
  toolSlug: string;
  inputFileIds: string[];
  configuration?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey) {
    return NextResponse.json({ errorCode: "IDEMPOTENCY_KEY_REQUIRED" }, { status: 400 });
  }

  // Now durable: a retry after a deploy or on another instance still dedupes.
  const existingJobId = await lookupIdempotencyKey(idempotencyKey);
  if (existingJobId) {
    return NextResponse.json({ jobId: existingJobId, status: "processing" });
  }

  const body = (await request.json()) as Partial<CreateJobBody>;
  if (!body.toolSlug || !getToolBySlug(body.toolSlug) || !body.inputFileIds?.length) {
    return NextResponse.json({ errorCode: "INVALID_REQUEST" }, { status: 400 });
  }

  // Every input must be a real, verified upload — not merely a reserved row.
  const checks = await Promise.all(body.inputFileIds.map((fileId) => isFileUploaded(fileId)));
  if (checks.some((uploaded) => !uploaded)) {
    return NextResponse.json(
      { errorCode: "INPUT_NOT_READY", errorMessage: "Those files aren't finished uploading yet." },
      { status: 409 }
    );
  }

  const user = await getSessionUser();
  const job = await createJob({
    toolSlug: body.toolSlug,
    ownerId: user?.id ?? null,
    configuration: body.configuration,
    inputFileIds: body.inputFileIds,
  });

  await recordIdempotencyKey(idempotencyKey, job.id);

  // TODO (Phase 2): enqueue to BullMQ instead of starting the mock in-process.
  const started = await updateJob(job.id, { status: "processing", startedAt: new Date() });
  if (started) void mockProcessor.start(started);

  return NextResponse.json({ jobId: job.id, status: "processing" });
}
