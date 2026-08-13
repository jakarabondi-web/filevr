import { NextRequest, NextResponse } from "next/server";
import { LocalStorageDriver } from "@/lib/storage/local-driver";

/** Serving end of a local-driver presigned GET. See the upload route. */
export async function GET(request: NextRequest) {
  if ((process.env.STORAGE_DRIVER ?? "local").toLowerCase() !== "local") {
    return NextResponse.json({ errorCode: "NOT_ENABLED" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const expires = Number(searchParams.get("expires"));
  const signature = searchParams.get("signature");
  const filename = searchParams.get("filename") ?? "download";

  if (!key || !signature || !Number.isFinite(expires)) {
    return NextResponse.json({ errorCode: "INVALID_REQUEST" }, { status: 400 });
  }

  const driver = LocalStorageDriver.fromEnv();
  if (!driver.verify(key, expires, "get", signature)) {
    return NextResponse.json({ errorCode: "SIGNATURE_INVALID_OR_EXPIRED" }, { status: 403 });
  }

  let body: Buffer;
  try {
    body = await driver.get(key);
  } catch {
    return NextResponse.json({ errorCode: "NOT_FOUND" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "content-type": "application/octet-stream",
      "content-length": String(body.byteLength),
      "content-disposition": `attachment; filename="${filename.replace(/["\r\n]/g, "")}"`,
      // Signed, expiring, per-user content must never land in a shared cache.
      "cache-control": "private, no-store",
    },
  });
}
