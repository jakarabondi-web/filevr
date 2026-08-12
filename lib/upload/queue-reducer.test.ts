import { describe, expect, it } from "vitest";
import {
  initialUploadQueueState,
  uploadQueueReducer,
} from "./queue-reducer";
import type { QueuedFile } from "@/types";

function makeFile(overrides: Partial<QueuedFile> = {}): QueuedFile {
  return {
    id: overrides.id ?? "f1",
    file: new File(["content"], "doc.pdf", { type: "application/pdf" }),
    name: "doc.pdf",
    size: 1024,
    mimeType: "application/pdf",
    status: "pending",
    progress: 0,
    ...overrides,
  };
}

describe("uploadQueueReducer", () => {
  it("adds files to an empty queue", () => {
    const state = uploadQueueReducer(initialUploadQueueState, {
      type: "ADD_FILES",
      files: [makeFile()],
    });
    expect(state.files).toHaveLength(1);
    expect(state.files[0].name).toBe("doc.pdf");
  });

  it("removes a file by id", () => {
    const withFile = uploadQueueReducer(initialUploadQueueState, {
      type: "ADD_FILES",
      files: [makeFile({ id: "a" }), makeFile({ id: "b" })],
    });
    const state = uploadQueueReducer(withFile, { type: "REMOVE_FILE", id: "a" });
    expect(state.files.map((f) => f.id)).toEqual(["b"]);
  });

  it("updates progress for the matching file only", () => {
    const withFiles = uploadQueueReducer(initialUploadQueueState, {
      type: "ADD_FILES",
      files: [makeFile({ id: "a" }), makeFile({ id: "b" })],
    });
    const state = uploadQueueReducer(withFiles, {
      type: "SET_PROGRESS",
      id: "a",
      progress: 42,
    });
    expect(state.files.find((f) => f.id === "a")?.progress).toBe(42);
    expect(state.files.find((f) => f.id === "b")?.progress).toBe(0);
  });

  it("sets an error and marks the file status as error", () => {
    const withFile = uploadQueueReducer(initialUploadQueueState, {
      type: "ADD_FILES",
      files: [makeFile({ id: "a" })],
    });
    const state = uploadQueueReducer(withFile, {
      type: "SET_ERROR",
      id: "a",
      errorCode: "FILE_TOO_LARGE",
      errorMessage: "too big",
    });
    const file = state.files.find((f) => f.id === "a");
    expect(file?.status).toBe("error");
    expect(file?.errorCode).toBe("FILE_TOO_LARGE");
  });

  it("retry clears error state and resets progress", () => {
    const errored = uploadQueueReducer(
      uploadQueueReducer(initialUploadQueueState, {
        type: "ADD_FILES",
        files: [makeFile({ id: "a", progress: 50 })],
      }),
      { type: "SET_ERROR", id: "a", errorCode: "CORRUPT_FILE", errorMessage: "bad" }
    );
    const state = uploadQueueReducer(errored, { type: "RETRY", id: "a" });
    const file = state.files.find((f) => f.id === "a");
    expect(file?.status).toBe("pending");
    expect(file?.progress).toBe(0);
    expect(file?.errorCode).toBeUndefined();
  });

  it("reset clears the queue", () => {
    const withFile = uploadQueueReducer(initialUploadQueueState, {
      type: "ADD_FILES",
      files: [makeFile()],
    });
    const state = uploadQueueReducer(withFile, { type: "RESET" });
    expect(state.files).toHaveLength(0);
  });
});
