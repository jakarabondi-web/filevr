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

const LEFT_ORDER = ["pdf-to-word", "compress-pdf", "sign-pdf"];
const RIGHT_ORDER = ["edit-pdf", "ocr-pdf", "merge-pdf"];
const LEFT_CHIPS = LEFT_ORDER.map((slug) => TOOLS.find((t) => t.slug === slug)!);
const RIGHT_CHIPS = RIGHT_ORDER.map((slug) => TOOLS.find((t) => t.slug === slug)!);

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
          {LEFT_CHIPS.map((tool, i) => (
            <div key={tool.slug} className="rise-in" style={{ animationDelay: `${0.22 + i * 0.06}s` }}>
              <ActionChip
                tool={tool}
                side="left"
                recommended={hasFiles && recommended.some((r) => r.slug === tool.slug)}
                onSelect={openPicker}
              />
            </div>
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
          <div className="rise-in relative flex items-center justify-center" style={{ animationDelay: "0.16s" }}>
            <DocumentStack />
            <label
              className="absolute top-[54%] flex size-36 sm:size-40 lg:size-[176px] -translate-y-1/2 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full bg-lime text-center text-lime-ink transition-transform duration-150 hover:-translate-y-[calc(50%+3px)] active:translate-y-[calc(-50%+3px)] focus-within:ring-4 focus-within:ring-primary/40"
              style={{
                boxShadow:
                  "0 0 0 4px var(--paper), 0 0 0 5px rgba(18,16,20,0.14), 0 10px 0 -2px var(--lime-deep), 0 18px 26px -8px rgba(18,16,20,0.4)",
              }}
            >
              <span
                className="pointer-events-none absolute inset-[9px] rounded-full border border-dashed border-lime-ink/35"
                aria-hidden="true"
              />
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
              <span className="font-display text-lg leading-[0.95] tracking-tight sm:text-xl">
                {hasFiles ? `${files.length} FILE${files.length > 1 ? "S" : ""}` : "DROP"}
              </span>
              {!hasFiles && <span className="font-display text-lg leading-[0.95] tracking-tight sm:text-xl">FILES</span>}
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
          {RIGHT_CHIPS.map((tool, i) => (
            <div key={tool.slug} className="rise-in" style={{ animationDelay: `${0.22 + i * 0.06}s` }}>
              <ActionChip
                tool={tool}
                side="right"
                recommended={hasFiles && recommended.some((r) => r.slug === tool.slug)}
                onSelect={openPicker}
              />
            </div>
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
                tool.accent === "coral" && "bg-coral text-white",
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
