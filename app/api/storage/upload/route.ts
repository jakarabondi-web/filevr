import { NextRequest, NextResponse } from "next/server";
import { LocalStorageDriver } from "@/lib/storage/local-driver";

/**
 * Receiving end of a local-driver presigned PUT. Exists only so development
 * exercises the same direct-to-storage flow as production; with STORAGE_DRIVER=s3
 * the browser PUTs to S3 and never reaches this route.
 */
export async function PUT(request: NextRequest) {
  if ((process.env.STORAGE_DRIVER ?? "local").toLowerCase() !== "local") {
    return NextResponse.json({ errorCode: "NOT_ENABLED" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const expires = Number(searchParams.get("expires"));
  const signature = searchParams.get("signature");

  if (!key || !signature || !Number.isFinite(expires)) {
    return NextResponse.json({ errorCode: "INVALID_REQUEST" }, { status: 400 });
  }

  const driver = LocalStorageDriver.fromEnv();
  if (!driver.verify(key, expires, "put", signature)) {
    return NextResponse.json({ errorCode: "SIGNATURE_INVALID_OR_EXPIRED" }, { status: 403 });
  }

  const body = Buffer.from(await request.arrayBuffer());
  await driver.put(key, body, request.headers.get("content-type") ?? "application/octet-stream");

  return new NextResponse(null, { status: 200 });
}
