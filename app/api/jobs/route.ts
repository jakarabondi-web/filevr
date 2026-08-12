import { NextRequest, NextResponse } from "next/server";
import { createJob, updateJob } from "@/lib/jobs/store";
import { mockProcessor } from "@/lib/jobs/mock-processor-instance";
import { getToolBySlug } from "@/config/tools";
import { getSessionUser } from "@/lib/auth";

const seenIdempotencyKeys = new Map<string, string>();

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

  const existingJobId = seenIdempotencyKeys.get(idempotencyKey);
  if (existingJobId) {
    return NextResponse.json({ jobId: existingJobId, status: "queued" });
  }

  const body = (await request.json()) as Partial<CreateJobBody>;
  if (!body.toolSlug || !getToolBySlug(body.toolSlug) || !body.inputFileIds?.length) {
    return NextResponse.json({ errorCode: "INVALID_REQUEST" }, { status: 400 });
  }

  const user = await getSessionUser();
  const job = createJob({
    toolSlug: body.toolSlug,
    ownerId: user?.id ?? null,
    configuration: body.configuration,
    inputFileIds: body.inputFileIds,
  });

  seenIdempotencyKeys.set(idempotencyKey, job.id);

  const started = updateJob(job.id, { status: "processing" });
  if (started) void mockProcessor.start(started);

  return NextResponse.json({ jobId: job.id, status: "processing" });
}
