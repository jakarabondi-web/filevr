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

describe("validateQueue — total size", () => {
  it("rejects a batch whose combined size exceeds the free total", () => {
    const result = validateQueue(0, [
      { size: 300 * 1024 * 1024 },
      { size: 300 * 1024 * 1024 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("TOTAL_SIZE_EXCEEDED");
  });

  it("counts bytes already queued toward the total", () => {
    const result = validateQueue(1, [{ size: 200 * 1024 * 1024 }], 400 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("TOTAL_SIZE_EXCEEDED");
  });

  it("accepts a batch inside both limits", () => {
    expect(validateQueue(1, [{ size: 10 * 1024 * 1024 }], 20 * 1024 * 1024).valid).toBe(true);
  });
});
