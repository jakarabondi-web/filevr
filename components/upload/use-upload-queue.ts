"use client";

import { useCallback, useReducer, useRef } from "react";
import {
  initialUploadQueueState,
  uploadQueueReducer,
} from "@/lib/upload/queue-reducer";
import { validateFile, validateQueue, type FileValidationResult } from "@/lib/validation/file";
import type { QueuedFile } from "@/types";
import { track } from "@/lib/analytics";

let counter = 0;
function nextId() {
  counter += 1;
  return `qf_${counter}_${Date.now()}`;
}

export function useUploadQueue() {
  const [state, dispatch] = useReducer(uploadQueueReducer, initialUploadQueueState);
  const timers = useRef(new Map<string, ReturnType<typeof setInterval>>());

  const simulateUpload = useCallback((queuedId: string) => {
    dispatch({ type: "SET_STATUS", id: queuedId, status: "uploading" });
    track("upload_started");
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.round(15 + Math.random() * 20));
      dispatch({ type: "SET_PROGRESS", id: queuedId, progress });
      if (progress >= 100) {
        clearInterval(timer);
        timers.current.delete(queuedId);
        dispatch({ type: "SET_STATUS", id: queuedId, status: "uploaded" });
        track("upload_completed");
      }
    }, 220);
    timers.current.set(queuedId, timer);
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
        if (qf.status === "pending") simulateUpload(qf.id);
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
    [simulateUpload, state.files]
  );

  const removeFile = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearInterval(timer);
      timers.current.delete(id);
    }
    dispatch({ type: "REMOVE_FILE", id });
  }, []);

  const retryFile = useCallback(
    (id: string) => {
      dispatch({ type: "RETRY", id });
      simulateUpload(id);
    },
    [simulateUpload]
  );

  const reset = useCallback(() => {
    timers.current.forEach((t) => clearInterval(t));
    timers.current.clear();
    dispatch({ type: "RESET" });
  }, []);

  return { files: state.files, addFiles, removeFile, retryFile, reset };
}
