"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TOOLS, recommendTools } from "@/config/tools";
import type { ToolDefinition } from "@/types";
import { useUploadQueue } from "@/components/upload/use-upload-queue";
import { ToolIcon } from "@/components/ui/tool-icon";
import { FileRow } from "@/components/upload/file-row";
import { DocumentStack } from "@/components/upload/document-stack";
import { ProposalSheet, ContractSheet, InvoiceSheet } from "@/components/upload/document-sheets";
import { track } from "@/lib/analytics";

/**
 * Desktop hero is an aspect-locked poster canvas (1600×760 design units).
 * 1 design unit = 1/16 cqw, so every element scales with the canvas width.
 */
const u = (n: number) => `${n / 16}cqw`;

const ACCENT_CLASSES: Record<ToolDefinition["accent"], string> = {
  lime: "bg-lime text-lime-ink",
  indigo: "bg-primary text-white",
  coral: "bg-coral text-white",
  sky: "bg-sky-500 text-white",
};

/** Chip centers in canvas units, mirroring the reference composition. */
const CHIP_LAYOUT: { slug: string; x: number; y: number }[] = [
  { slug: "pdf-to-word", x: 296, y: 502 },
  { slug: "compress-pdf", x: 242, y: 601 },
  { slug: "sign-pdf", x: 430, y: 691 },
  { slug: "edit-pdf", x: 1388, y: 260 },
  { slug: "ocr-pdf", x: 1390, y: 522 },
  { slug: "merge-pdf", x: 1330, y: 694 },
];

const SUPPORTED_FORMATS = "PDF, Word, Excel, PowerPoint, JPG, PNG, HEIC, TXT";
const SHEET_SHADOW = "0 2px 5px rgba(18,16,20,0.08), 0 24px 44px -18px rgba(18,16,20,0.35)";
const SHEET_SHADOW_FRONT = "0 3px 8px rgba(18,16,20,0.1), 0 32px 56px -20px rgba(18,16,20,0.4)";

/** Inked connector lines, endpoint dots, and the hand-drawn annotation arrow. */
function ConnectorLayer() {
  return (
    <svg
      viewBox="0 0 1600 760"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
    >
      <g stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M382 504 C452 516 496 522 538 510" />
        <path d="M350 601 C438 601 496 590 556 578" />
        <path d="M506 692 C572 706 626 700 660 678" />
        <path d="M1312 266 C1290 302 1276 334 1262 364" />
        <path d="M1316 518 C1294 508 1276 496 1258 484" />
        <path d="M1252 688 C1242 662 1236 630 1234 602" />
      </g>
      <g fill="var(--ink)">
        <circle cx="546" cy="507" r="6.5" />
        <circle cx="564" cy="575" r="6.5" />
        <circle cx="1260" cy="369" r="6.5" />
        <circle cx="1254" cy="481" r="6.5" />
        <circle cx="1234" cy="596" r="6.5" />
      </g>
      {/* Sign connector arrowhead */}
      <path d="M672 668 L650 672 L664 686 Z" fill="var(--ink)" />
      {/* Hand-drawn arrow from the subhead toward the documents */}
      <g stroke="var(--ink)" strokeWidth="6.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M396 388 C444 396 474 412 492 434" />
        <path d="M497 439 L472 432" />
        <path d="M497 439 L489 414" />
      </g>
    </svg>
  );
}

/** Sketchy marker double-ring for the drop circle. */
function HandDrawnRing() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="pointer-events-none absolute inset-[3%] text-lime-ink/80">
      <path
        d="M100 7 C138 5 172 32 186 64 C198 94 194 136 168 163 C142 190 104 198 72 188 C40 178 12 150 8 112 C4 74 22 34 58 16 C72 9 86 8 100 7 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
      />
      <path
        d="M100 16 C132 14 162 36 175 65 C187 92 183 130 159 154 C135 178 102 188 73 179 C44 170 20 144 16 110 C12 76 30 40 62 24 C74 18 87 17 100 16 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
      />
    </svg>
  );
}

function UploadGlyph({ width }: { width: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={{ width }}
      fill="none"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M32 40V12" />
      <path d="M20 24 32 11 44 24" />
      <path d="M12 46v6a5 5 0 0 0 5 5h30a5 5 0 0 0 5-5v-6" />
    </svg>
  );
}

export function HeroWorkbench() {
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

  const dragHandlers = {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
  };

  const hasFiles = files.length > 0;
  const dropLabel = hasFiles ? `${files.length} FILE${files.length > 1 ? "S" : ""}` : "DROP";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        aria-label={`Upload files — ${SUPPORTED_FORMATS}`}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.heic,.txt"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* ——— Mobile / tablet: stacked editorial layout ——— */}
      <div className="px-4 pt-8 sm:px-8 lg:hidden" {...dragHandlers}>
        <h1 className="font-display max-w-3xl text-[46px] uppercase leading-[0.94] tracking-[-0.01em] text-ink sm:text-[64px]">
          Files in.
          <br />
          Finished
          <br />
          work out.
        </h1>
        <p className="mt-4 max-w-xs text-base font-medium text-ink sm:text-lg">
          One workspace for every document job.
        </p>

        <div className="relative mt-4 flex items-center justify-center">
          <DocumentStack />
          <button
            type="button"
            onClick={() => openPicker()}
            aria-label={`Upload files — ${SUPPORTED_FORMATS}`}
            className={cn(
              "absolute top-[54%] flex size-36 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full bg-lime text-lime-ink transition-transform duration-150 hover:-translate-y-[calc(50%+3px)] active:translate-y-[calc(-50%+3px)] focus-ring sm:size-40",
              isDragging && "ring-4 ring-primary/50"
            )}
            style={{
              boxShadow:
                "0 0 0 4px var(--paper), 0 0 0 5px rgba(18,16,20,0.14), 0 10px 0 -2px var(--lime-deep), 0 18px 26px -8px rgba(18,16,20,0.4)",
            }}
          >
            <span className="pointer-events-none absolute inset-[7px] rounded-full border-2 border-lime-ink/50" aria-hidden="true" />
            <UploadGlyph width="30px" />
            <span className="font-display text-lg leading-[0.95] tracking-tight sm:text-xl">
              {dropLabel}
              <br />
              FILES
            </span>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CHIP_LAYOUT.map(({ slug }) => {
            const tool = TOOLS.find((t) => t.slug === slug)!;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => openPicker(tool)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold shadow-[var(--shadow-card)] focus-ring",
                  ACCENT_CLASSES[tool.accent],
                  hasFiles &&
                    recommended.some((r) => r.slug === tool.slug) &&
                    "ring-2 ring-ink ring-offset-2 ring-offset-paper"
                )}
              >
                <ToolIcon name={tool.icon} className="size-4" aria-hidden="true" />
                {tool.shortName}
              </button>
            );
          })}
        </div>

        <details className="mt-4 pb-2 text-center">
          <summary className="cursor-pointer text-xs font-medium text-muted underline decoration-dotted focus-ring">
            Supported formats
          </summary>
          <p className="mt-1 text-xs text-muted">{SUPPORTED_FORMATS}</p>
        </details>
      </div>

      {/* ——— Desktop: aspect-locked poster canvas ——— */}
      <div className="@container relative hidden lg:block">
        <div className="relative w-full" style={{ aspectRatio: "1600 / 760" }} {...dragHandlers}>
          <h1
            className="font-display absolute z-10 uppercase text-ink"
            style={{ left: u(45), top: u(10), fontSize: u(96), lineHeight: 0.9, letterSpacing: "-0.005em" }}
          >
            Files in.
            <br />
            Finished
            <br />
            work out.
          </h1>
          <p
            className="absolute z-10 font-medium text-ink"
            style={{ left: u(50), top: u(330), width: u(320), fontSize: u(26), lineHeight: 1.35 }}
          >
            One workspace for every document job.
          </p>

          {/* Paper sheets */}
          <div
            className="absolute z-10 rounded-[5px] border border-black/10 bg-white"
            style={{ left: u(497), top: u(62), width: u(272), height: u(648), transform: "rotate(-4.5deg)", boxShadow: SHEET_SHADOW }}
          >
            <ProposalSheet />
          </div>
          <div
            className="absolute z-10 rounded-[5px] border border-black/10 bg-white"
            style={{ left: u(1060), top: u(92), width: u(258), height: u(590), transform: "rotate(6.5deg)", boxShadow: SHEET_SHADOW }}
          >
            <InvoiceSheet />
          </div>
          <div
            className="absolute z-20 rounded-[5px] border border-black/10 bg-white"
            style={{ left: u(756), top: u(34), width: u(312), height: u(686), transform: "rotate(0.8deg)", boxShadow: SHEET_SHADOW_FRONT }}
          >
            <ContractSheet />
          </div>

          <ConnectorLayer />

          {/* Drop circle */}
          <div
            className="absolute z-40"
            style={{ left: u(872), top: u(450), width: u(278), height: u(278), transform: "translate(-50%, -50%)" }}
          >
            <button
              type="button"
              onClick={() => openPicker()}
              aria-label={`Upload files — ${SUPPORTED_FORMATS}`}
              className={cn(
                "relative flex h-full w-full flex-col items-center justify-center rounded-full bg-lime text-lime-ink transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] focus-ring",
                isDragging && "ring-8 ring-primary/50"
              )}
              style={{
                gap: u(10),
                boxShadow:
                  "0 0 0 5px var(--paper), 0 0 0 6.5px rgba(18,16,20,0.15), 0 16px 0 -4px var(--lime-deep), 0 30px 40px -12px rgba(18,16,20,0.45)",
              }}
            >
              <HandDrawnRing />
              <UploadGlyph width={u(56)} />
              <span className="font-display text-center uppercase" style={{ fontSize: u(34), lineHeight: 0.98 }}>
                {dropLabel}
                <br />
                FILES
              </span>
              {selectedTool && hasFiles && (
                <span className="font-semibold" style={{ fontSize: u(11) }}>
                  {selectedTool.shortName} next
                </span>
              )}
            </button>
          </div>

          {/* Action chips */}
          {CHIP_LAYOUT.map(({ slug, x, y }) => {
            const tool = TOOLS.find((t) => t.slug === slug)!;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => openPicker(tool)}
                aria-label={`${tool.shortName}: ${tool.description}`}
                className={cn(
                  "absolute z-50 inline-flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full font-semibold transition-[filter] duration-150 hover:brightness-105 focus-ring",
                  ACCENT_CLASSES[tool.accent],
                  hasFiles &&
                    recommended.some((r) => r.slug === tool.slug) &&
                    "ring-[3px] ring-ink ring-offset-2 ring-offset-paper"
                )}
                style={{
                  left: u(x),
                  top: u(y),
                  gap: u(11),
                  padding: `${u(14)} ${u(27)}`,
                  fontSize: u(23),
                  boxShadow: "0 12px 24px -10px rgba(18,16,20,0.35)",
                }}
              >
                <ToolIcon name={tool.icon} style={{ width: u(26), height: u(26) }} aria-hidden="true" />
                {tool.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ——— Shared: upload queue ——— */}
      {hasFiles && (
        <div className="mx-auto mt-2 max-w-lg px-4 pb-8 sm:px-0">
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
