"use client";

import { cn, formatBytes } from "@/lib/utils";
import { FilevrIcon } from "@/components/ui/filevr-icon";
import type { FilevrIconName } from "@/components/ui/filevr-icon";
import type { QueuedFile } from "@/types";

function iconFor(file: QueuedFile): FilevrIconName {
  if (file.mimeType === "application/pdf" || /\.pdf$/i.test(file.name)) return "file-pdf";
  if (/\.docx?$/i.test(file.name)) return "file-word";
  if (file.mimeType.startsWith("image/")) return "image-file";
  return "file-generic";
}

/**
 * The selected files, with per-file upload state. Rejected and failed files
 * carry a coral marker and offer Retry / Remove, per the spec's edge cases.
 */
export function FileQueue({
  files,
  onRemove,
  onRetry,
  compact = false,
}: {
  files: QueuedFile[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  compact?: boolean;
}) {
  if (files.length === 0) return null;

  return (
    <section
      aria-label="Selected files"
      className={cn(
        "rounded-xl border border-ink/20 bg-paper-light",
        compact ? "p-2.5" : "p-3"
      )}
    >
      <ul className="flex flex-col gap-1.5">
        {files.map((file) => {
          const failed = file.status === "error";
          return (
            <li
              key={file.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2",
                failed ? "bg-coral/12" : "bg-white/55"
              )}
            >
              <FilevrIcon
                name={iconFor(file)}
                className={cn("size-5 shrink-0", failed ? "text-coral" : "text-ink/70")}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink" title={file.name}>
                  {file.name}
                </p>
                {failed ? (
                  <p className="text-[11.5px] leading-snug text-coral">{file.errorMessage}</p>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11.5px] tabular-nums text-ink/55">
                      {formatBytes(file.size)}
                    </span>
                    {file.status === "uploaded" ? (
                      <span className="text-[11.5px] font-semibold text-ink/70">Ready</span>
                    ) : (
                      <span
                        className="h-1.5 w-20 overflow-hidden rounded-full bg-ink/15"
                        role="progressbar"
                        aria-valuenow={file.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Uploading ${file.name}`}
                      >
                        <span
                          className="block h-full rounded-full bg-cobalt transition-[width]"
                          style={{ width: `${file.progress}%` }}
                        />
                      </span>
                    )}
                  </div>
                )}
              </div>

              {failed && (
                <button
                  type="button"
                  onClick={() => onRetry(file.id)}
                  aria-label={`Retry ${file.name}`}
                  className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold text-ink underline decoration-ink/35 underline-offset-2 hover:decoration-ink focus-ring"
                >
                  Retry
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded-md p-1 text-ink/60 hover:text-ink focus-ring"
              >
                <FilevrIcon name="close" className="size-4" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
