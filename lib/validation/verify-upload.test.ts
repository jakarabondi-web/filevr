import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { verifyUploadedBytes } from "./verify-upload";
import { FREE_LIMITS } from "@/config/tools";

/** Minimal but structurally valid PDF with two page objects. */
function samplePdf(pages = 2): Buffer {
  const pageObjs = Array.from(
    { length: pages },
    (_, i) => `${i + 3} 0 obj<</Type/Page /Parent 2 0 R/MediaBox[0 0 200 200]>>endobj`
  ).join("\n");
  return Buffer.from(
    `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n` +
      `2 0 obj<</Type/Pages/Kids[]/Count ${pages}>>endobj\n${pageObjs}\ntrailer<</Root 1 0 R>>\n%%EOF`
  );
}

/** Signature plus an IHDR chunk — detectors validate structure, not just magic. */
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from([0, 0, 0, 13]),
  Buffer.from("IHDR"),
  Buffer.alloc(13, 1),
  Buffer.alloc(4, 0),
]);

/** Binary with no recognizable signature at all. */
const OPAQUE_BINARY = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe, 0x07, 0x00]);

describe("verifyUploadedBytes", () => {
  it("accepts a real PDF and reports its digest and page count", async () => {
    const bytes = samplePdf(3);
    const result = await verifyUploadedBytes(bytes, {
      sizeBytes: bytes.length,
      mimeType: "application/pdf",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(result.pageCount).toBe(3);
    expect(result.mimeType).toBe("application/pdf");
  });

  it("rejects bytes that lie about their type", async () => {
    const result = await verifyUploadedBytes(PNG, {
      sizeBytes: PNG.length,
      mimeType: "application/pdf",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    // A PNG is a supported type on its own, but not under a .pdf declaration.
    expect(result.errorCode).toBe("TYPE_MISMATCH");
  });

  it("rejects a size that does not match the reservation", async () => {
    const bytes = samplePdf();
    const result = await verifyUploadedBytes(bytes, {
      sizeBytes: bytes.length + 10,
      mimeType: "application/pdf",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errorCode).toBe("SIZE_MISMATCH");
  });

  it("rejects an empty upload", async () => {
    const result = await verifyUploadedBytes(Buffer.alloc(0), {
      sizeBytes: 0,
      mimeType: "application/pdf",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errorCode).toBe("BYTES_MISSING");
  });

  it("rejects bytes over the free per-file limit", async () => {
    const bytes = Buffer.alloc(FREE_LIMITS.maxFileSizeBytes + 1);
    samplePdf().copy(bytes);
    const result = await verifyUploadedBytes(bytes, {
      sizeBytes: bytes.length,
      mimeType: "application/pdf",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errorCode).toBe("FILE_TOO_LARGE");
  });

  it("accepts plain text, which carries no magic bytes", async () => {
    const bytes = Buffer.from("just some notes");
    const result = await verifyUploadedBytes(bytes, {
      sizeBytes: bytes.length,
      mimeType: "text/plain",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pageCount).toBeUndefined();
  });

  it("rejects unrecognizable binary smuggled in as plain text", async () => {
    const result = await verifyUploadedBytes(OPAQUE_BINARY, {
      sizeBytes: OPAQUE_BINARY.length,
      mimeType: "text/plain",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errorCode).toBe("TYPE_MISMATCH");
  });
});
