import { NextRequest, NextResponse } from "next/server";
import {
  createJob,
  isFileUploaded,
  lookupIdempotencyKey,
  recordIdempotencyKey,
  updateJob,
} from "@/lib/db/repository";
import { enqueueConversion } from "@/lib/queue/producer";
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

  // Hand off to the worker. The API never processes bytes itself.
  try {
    await enqueueConversion({ jobId: job.id, toolSlug: body.toolSlug });
  } catch (err) {
    await updateJob(job.id, {
      status: "processing_failed",
      errorCode: "QUEUE_UNAVAILABLE",
      errorMessage: "We couldn't start processing. Try again in a moment.",
    });
    console.error("Failed to enqueue job", job.id, err);
    return NextResponse.json({ errorCode: "QUEUE_UNAVAILABLE" }, { status: 503 });
  }

  return NextResponse.json({ jobId: job.id, status: "queued" });
}
