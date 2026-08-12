import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/lib/jobs/store";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const file = getFile(fileId);
  if (!file) {
    return NextResponse.json({ errorCode: "NOT_FOUND" }, { status: 404 });
  }
  // TODO: verify uploaded bytes exist in storage, run malware scan, detect real type.
  return NextResponse.json({ file, status: "uploaded" });
}
