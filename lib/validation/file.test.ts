import { describe, expect, it } from "vitest";
import { validateFile, validateQueue } from "./file";
import { FREE_LIMITS } from "@/config/tools";

describe("validateFile", () => {
  it("accepts a supported PDF within size limits", () => {
    const result = validateFile({ name: "doc.pdf", type: "application/pdf", size: 1024 });
    expect(result.valid).toBe(true);
  });

  it("rejects an unsupported type", () => {
    const result = validateFile({ name: "archive.zip", type: "application/zip", size: 1024 });
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("UNSUPPORTED_TYPE");
  });

  it("rejects a file over the free size limit", () => {
    const result = validateFile({
      name: "big.pdf",
      type: "application/pdf",
      size: FREE_LIMITS.maxFileSizeBytes + 1,
    });
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("FILE_TOO_LARGE");
  });

  it("accepts files recognized by extension when MIME type is generic", () => {
    const result = validateFile({ name: "scan.png", type: "", size: 1024 });
    expect(result.valid).toBe(true);
  });
});

describe("validateQueue", () => {
  it("allows adding files under the per-task limit", () => {
    const result = validateQueue(0, [{ size: 1024 }]);
    expect(result.valid).toBe(true);
  });

  it("rejects adding files that would exceed the per-task limit", () => {
    const result = validateQueue(FREE_LIMITS.filesPerTask, [{ size: 1024 }]);
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("TASK_LIMIT_EXCEEDED");
  });
});
