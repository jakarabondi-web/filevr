"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOLS, recommendTools } from "@/config/tools";
import type { ToolDefinition } from "@/types";
import { useUploadQueue } from "@/components/upload/use-upload-queue";
import { ActionChip } from "@/components/upload/action-chip";
import { DocumentStack } from "@/components/upload/document-stack";
import { FileRow } from "@/components/upload/file-row";
import { track } from "@/lib/analytics";

const LEFT_CHIPS = TOOLS.filter((t) => ["pdf-to-word", "compress-pdf", "sign-pdf"].includes(t.slug));
const RIGHT_CHIPS = TOOLS.filter((t) => ["edit-pdf", "ocr-pdf", "merge-pdf"].includes(t.slug));

const SUPPORTED_FORMATS = "PDF, Word, Excel, PowerPoint, JPG, PNG, HEIC, TXT";

export function DocumentWorkbench() {
  const { files, addFiles, removeFile, retryFile } = useUploadQueue();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recommended = useMemo(
    () =>
      recommendTools(
        files.filter((f) => f.status !== "error").map((f) => ({ name: f.name, mimeType: f.mimeType }))
      ),
    [files]
  );

  const openPicker = useCallback((tool?: ToolDefinition) => {
    if (tool) {
      setSelectedTool(tool);
      track("tool_selected", { tool: tool.slug });
    }
    inputRef.current?.click();
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      addFiles(Array.from(fileList));
    },
    [addFiles]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const hasFiles = files.length > 0;

  return (
    <div className="px-4 pb-10 sm:px-8 md:px-10">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[auto_1fr_auto] lg:gap-2">
        <div className="hidden lg:flex h-[420px] flex-col justify-between py-6">
          {LEFT_CHIPS.map((tool) => (
            <ActionChip
              key={tool.slug}
              tool={tool}
              side="left"
              recommended={hasFiles && recommended.some((r) => r.slug === tool.slug)}
              onSelect={openPicker}
            />
          ))}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-3xl p-4 transition-colors",
            isDragging && "bg-drag-bg outline-2 outline-dashed outline-drag-border"
          )}
        >
          <div className="relative flex items-center justify-center">
            <DocumentStack />
            <label className="absolute flex size-36 sm:size-40 lg:size-[172px] cursor-pointer flex-col items-center justify-center gap-1 rounded-full bg-lime text-center text-lime-ink shadow-[0_8px_0_rgba(0,0,0,0.15)] transition-transform hover:scale-[1.03] focus-within:ring-4 focus-within:ring-primary/40">
              <input
                ref={inputRef}
                type="file"
                multiple
                className="sr-only"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.heic,.txt"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <Upload aria-hidden="true" className="size-6 sm:size-7" strokeWidth={2.5} />
              <span className="text-base font-black leading-tight sm:text-lg">
                {hasFiles ? `${files.length} FILE${files.length > 1 ? "S" : ""}` : "DROP"}
              </span>
              {!hasFiles && <span className="text-base font-black leading-tight sm:text-lg">FILES</span>}
              {selectedTool && hasFiles && (
                <span className="text-[10px] font-semibold">{selectedTool.shortName} next</span>
              )}
            </label>
          </div>

          <p className="mt-6 max-w-xs text-center text-xs text-muted lg:hidden">
            Drop files anywhere in this area, or use the button above.
          </p>

          <details className="mt-4 text-center">
            <summary className="cursor-pointer text-xs font-medium text-muted underline decoration-dotted focus-ring">
              Supported formats
            </summary>
            <p className="mt-1 max-w-xs text-xs text-muted">{SUPPORTED_FORMATS}</p>
          </details>
        </div>

        <div className="hidden lg:flex h-[420px] flex-col justify-between py-6">
          {RIGHT_CHIPS.map((tool) => (
            <ActionChip
              key={tool.slug}
              tool={tool}
              side="right"
              recommended={hasFiles && recommended.some((r) => r.slug === tool.slug)}
              onSelect={openPicker}
            />
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 lg:hidden">
          {[...LEFT_CHIPS, ...RIGHT_CHIPS].map((tool) => (
            <button
              key={tool.slug}
              type="button"
              onClick={() => openPicker(tool)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold shadow-[var(--shadow-card)] focus-ring",
                tool.accent === "lime" && "bg-lime text-lime-ink",
                tool.accent === "indigo" && "bg-primary text-white",
                tool.accent === "coral" && "bg-[#ff5a4e] text-white",
                hasFiles && recommended.some((r) => r.slug === tool.slug) && "ring-2 ring-ink ring-offset-2 ring-offset-paper"
              )}
            >
              {tool.shortName}
            </button>
          ))}
        </div>
      </div>

      {hasFiles && (
        <div className="mx-auto mt-6 max-w-lg">
          <h2 className="mb-2 text-sm font-semibold text-text">Your files</h2>
          <ul className="space-y-2">
            {files.map((f) => (
              <FileRow key={f.id} file={f} onRemove={removeFile} onRetry={retryFile} />
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={files.some((f) => f.status === "uploading") || files.every((f) => f.status === "error")}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
            >
              Continue{selectedTool ? ` to ${selectedTool.name}` : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
