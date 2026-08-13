"use client";

import { useCallback, useReducer, useRef } from "react";
import {
  initialUploadQueueState,
  uploadQueueReducer,
} from "@/lib/upload/queue-reducer";
import {
  validateFile,
  validateQueue,
  type FileErrorCode,
  type FileValidationResult,
} from "@/lib/validation/file";
import { uploadFile, UploadError } from "@/lib/upload/upload-file";
import type { QueuedFile } from "@/types";
import { track } from "@/lib/analytics";

let counter = 0;
function nextId() {
  counter += 1;
  return `qf_${counter}_${Date.now()}`;
}

export function useUploadQueue() {
  const [state, dispatch] = useReducer(uploadQueueReducer, initialUploadQueueState);
  const controllers = useRef(new Map<string, AbortController>());

  /** Uploads for real: reserve, PUT to storage, confirm. */
  const startUpload = useCallback((queuedId: string, file: File) => {
    dispatch({ type: "SET_STATUS", id: queuedId, status: "uploading" });
    track("upload_started");

    const controller = new AbortController();
    controllers.current.set(queuedId, controller);

    void uploadFile(file, {
      signal: controller.signal,
      onProgress: (progress) => dispatch({ type: "SET_PROGRESS", id: queuedId, progress }),
    })
      .then(({ fileId }) => {
        dispatch({ type: "SET_UPLOADED", id: queuedId, serverFileId: fileId });
        track("upload_completed");
      })
      .catch((err: unknown) => {
        if (err instanceof UploadError && err.code === "ABORTED") return;
        const message =
          err instanceof UploadError ? err.message : "Upload failed. Check your connection and try again.";
        const code = err instanceof UploadError ? err.code : "UPLOAD_FAILED";
        dispatch({
          type: "SET_ERROR",
          id: queuedId,
          errorCode: code as FileErrorCode,
          errorMessage: message,
        });
        track("upload_failed", { reason: code });
      })
      .finally(() => controllers.current.delete(queuedId));
  }, []);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const limitCheck = validateQueue(
        state.files.length,
        incoming.map((f) => ({ size: f.size })),
        state.files.reduce((sum, f) => sum + f.size, 0)
      );
      if (!limitCheck.valid) {
        track("upload_failed", { reason: limitCheck.errorCode ?? "unknown" });
        return limitCheck;
      }

      const queued: QueuedFile[] = incoming.map((file) => {
        const validation = validateFile(file);
        return {
          id: nextId(),
          file,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          status: validation.valid ? "pending" : "error",
          progress: 0,
          errorCode: validation.errorCode,
          errorMessage: validation.errorMessage,
        };
      });

      dispatch({ type: "ADD_FILES", files: queued });
      queued.forEach((qf) => {
        if (qf.status === "pending") startUpload(qf.id, qf.file);
        else track("upload_failed", { reason: qf.errorCode ?? "unknown" });
      });

      // Surface the first per-file rejection so the caller can show it inline.
      const rejected = queued.find((qf) => qf.status === "error");
      if (rejected) {
        return {
          valid: false,
          errorCode: rejected.errorCode as FileValidationResult["errorCode"],
          errorMessage:
            queued.length > 1
              ? `${rejected.name}: ${rejected.errorMessage}`
              : rejected.errorMessage,
        } satisfies FileValidationResult;
      }

      return { valid: true } as const;
    },
    [startUpload, state.files]
  );

  const removeFile = useCallback((id: string) => {
    // Abort an upload in flight so its bytes stop consuming bandwidth.
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    dispatch({ type: "REMOVE_FILE", id });
  }, []);

  const retryFile = useCallback(
    (id: string) => {
      const target = state.files.find((f) => f.id === id);
      if (!target) return;
      dispatch({ type: "RETRY", id });
      startUpload(id, target.file);
    },
    [startUpload, state.files]
  );

  const reset = useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    controllers.current.clear();
    dispatch({ type: "RESET" });
  }, []);

  return { files: state.files, addFiles, removeFile, retryFile, reset };
}
