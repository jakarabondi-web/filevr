"use client";

import { File, FileText, Image as ImageIcon, RotateCw, X } from "lucide-react";
import { formatBytes, cn } from "@/lib/utils";
import type { QueuedFile } from "@/types";

export function FileRow({
  file,
  onRemove,
  onRetry,
}: {
  file: QueuedFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      {file.mimeType === "application/pdf" ? (
        <FileText aria-hidden="true" className="size-5 shrink-0 text-muted" />
      ) : file.mimeType.startsWith("image/") ? (
        <ImageIcon aria-hidden="true" className="size-5 shrink-0 text-muted" />
      ) : (
        <File aria-hidden="true" className="size-5 shrink-0 text-muted" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{file.name}</p>
        {file.status === "error" ? (
          <p className="text-xs text-danger">{file.errorMessage}</p>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted">{formatBytes(file.size)}</span>
            {(file.status === "uploading" || file.status === "pending") && (
              <div
                className="h-1.5 w-24 overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-valuenow={file.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Uploading ${file.name}`}
              >
                <div
                  className={cn("h-full rounded-full bg-primary transition-[width]")}
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            )}
            {file.status === "uploaded" && <span className="text-xs font-medium text-success">Uploaded</span>}
          </div>
        )}
      </div>
      {file.status === "error" && (
        <button
          type="button"
          onClick={() => onRetry(file.id)}
          className="rounded-md p-1.5 text-muted hover:text-text focus-ring"
          aria-label={`Retry ${file.name}`}
        >
          <RotateCw aria-hidden="true" className="size-4" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="rounded-md p-1.5 text-muted hover:text-text focus-ring"
        aria-label={`Remove ${file.name}`}
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
}
