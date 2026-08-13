"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { d, DROP, LAYER, SHEETS, STATEMENT } from "@/components/workbench/geometry";
import { ConnectorLayer, StatementArrow } from "@/components/workbench/connector-layer";
import { ContractPreview, InvoicePreview, ProposalPreview } from "@/components/workbench/document-sheets";
import { DropControl } from "@/components/workbench/drop-control";
import { WorkflowActionButton } from "@/components/workbench/workflow-action";
import { FileQueue } from "@/components/workbench/file-queue";
import { FREE_LIMITS } from "@/config/tools";
import { formatBytes } from "@/lib/utils";
import type { QueuedFile } from "@/types";
import {
  SUPPORTED_FORMATS_LABEL,
  WORKFLOW_ACTIONS,
  type WorkflowAction,
} from "@/components/workbench/data";

const LIMITS_CAPTION = `${SUPPORTED_FORMATS_LABEL} · up to ${formatBytes(
  FREE_LIMITS.maxFileSizeBytes
)} per file, ${FREE_LIMITS.filesPerTask} files per task`;

const SHEET_CLASS = "absolute overflow-hidden border border-paper-line bg-paper-light";

/** The three overlapping paper sheets. Decorative in full. */
function DocumentStack({ scaled }: { scaled: boolean }) {
  if (!scaled) {
    return (
      <div aria-hidden="true" className="absolute inset-0">
        <div className={cn(SHEET_CLASS, "left-0 top-6 h-[300px] w-[168px] -rotate-7")} style={{ boxShadow: "var(--shadow-paper)" }}>
          <div className="scale-[0.55] origin-top-left" style={{ width: "182%", height: "182%" }}>
            <ProposalPreview />
          </div>
        </div>
        <div className={cn(SHEET_CLASS, "left-1/2 top-0 h-[334px] w-[165px] -translate-x-1/2 -rotate-[0.5deg]")} style={{ boxShadow: "var(--shadow-paper)", zIndex: LAYER.sheet }}>
          <div className="scale-[0.55] origin-top-left" style={{ width: "182%", height: "182%" }}>
            <ContractPreview />
          </div>
        </div>
        <div className={cn(SHEET_CLASS, "right-0 top-5 h-[297px] w-[150px] rotate-7")} style={{ boxShadow: "var(--shadow-paper)" }}>
          <div className="scale-[0.55] origin-top-left" style={{ width: "182%", height: "182%" }}>
            <InvoicePreview />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true">
      {(
        [
          ["proposal", <ProposalPreview key="p" />],
          ["invoice", <InvoicePreview key="i" />],
          ["contract", <ContractPreview key="c" />],
        ] as const
      ).map(([key, preview]) => {
        const g = SHEETS[key];
        return (
          <div
            key={key}
            className={SHEET_CLASS}
            style={{
              left: d(g.left),
              top: d(g.top),
              width: d(g.width),
              height: d(g.height),
              transform: `rotate(${g.rotate}deg)`,
              boxShadow: "var(--shadow-paper)",
              // Contract renders last and sits above its neighbours.
              zIndex: key === "contract" ? LAYER.sheet + 1 : LAYER.sheet,
            }}
          >
            {preview}
          </div>
        );
      })}
    </div>
  );
}

interface DocumentWorkbenchProps {
  fileCount: number;
  selectedAction: string | null;
  loadingAction: string | null;
  onOpenPicker: () => void;
  onSelectAction: (action: WorkflowAction) => void;
  onFilesDropped: (files: FileList) => void;
  error: string | null;
  files: QueuedFile[];
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  scaled?: boolean;
}

export function DocumentWorkbench({
  fileCount,
  selectedAction,
  loadingAction,
  onOpenPicker,
  onSelectAction,
  onFilesDropped,
  error,
  files,
  onRemoveFile,
  onRetryFile,
  scaled = false,
}: DocumentWorkbenchProps) {
  const [dragActive, setDragActive] = useState(false);
  const depth = useRef(0);

  const dropZone = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      depth.current += 1;
      setDragActive(true);
    },
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      depth.current -= 1;
      if (depth.current <= 0) {
        depth.current = 0;
        setDragActive(false);
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      depth.current = 0;
      setDragActive(false);
      if (e.dataTransfer.files?.length) onFilesDropped(e.dataTransfer.files);
    },
  };

  const errorNode = error && (
    <p
      role="alert"
      className={cn(
        "rounded-lg border border-coral bg-coral/15 font-medium text-ink",
        scaled ? "shadow-[var(--shadow-paper)]" : "mt-4 px-4 py-2.5 text-sm"
      )}
      style={scaled ? { padding: `${d(10)} ${d(14)}`, fontSize: d(14) } : undefined}
    >
      {error}
    </p>
  );

  // ——— Below 1280px: flow layout, no connectors ———
  if (!scaled) {
    // `contents` lets the stack and the action grid become items of the
    // parent's two-column grid: stack beside the statement, actions below both.
    return (
      <div className="contents">
        {/* Drop surface only — keyboard access lives on the DropControl button
            inside it, so this must not be interactive itself. */}
        <div {...dropZone} className="rounded-2xl px-5 py-4 min-[480px]:px-7">
          <div className="relative mx-auto h-[360px] w-[300px]">
            <DocumentStack scaled={false} />
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: 120, zIndex: LAYER.drop }}
            >
              <DropControl fileCount={fileCount} dragActive={dragActive} onOpenPicker={onOpenPicker} />
            </div>
          </div>
        </div>

        <div className="px-5 min-[480px]:px-7 md:col-span-2 lg:px-10">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3 md:max-w-2xl md:grid-cols-3">
            {WORKFLOW_ACTIONS.map((action) => (
              <WorkflowActionButton
                key={action.slug}
                action={action}
                selected={selectedAction === action.slug}
                loading={loadingAction === action.slug}
                onSelect={onSelectAction}
              />
            ))}
          </div>
          {errorNode}
          <div className="mx-auto mt-4 max-w-md md:max-w-2xl">
            <FileQueue files={files} onRemove={onRemoveFile} onRetry={onRetryFile} compact />
            <p className="mt-3 text-center text-[11.5px] leading-snug text-ink/55">{LIMITS_CAPTION}</p>
          </div>
        </div>
      </div>
    );
  }

  // ——— Desktop: absolute composition in design-pixel space ———
  return (
    <>
      {/* Drop surface spanning the paper stack. Not focusable: the DropControl
          button is the keyboard entry point for the same action. */}
      <div
        {...dropZone}
        aria-hidden="true"
        className={cn("absolute rounded-3xl transition-colors", dragActive && "bg-cobalt/6")}
        style={{
          left: d(440),
          top: d(120),
          width: d(770),
          height: d(640),
          zIndex: LAYER.sheet - 1,
        }}
      />

      <DocumentStack scaled />
      <ConnectorLayer />

      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: d(STATEMENT.arrow.left),
          top: d(STATEMENT.arrow.top),
          width: d(STATEMENT.arrow.width),
          height: d(STATEMENT.arrow.height),
        }}
      >
        <StatementArrow />
      </div>

      <div className="absolute" style={{ left: d(DROP.left), top: d(DROP.top), zIndex: LAYER.drop }}>
        <DropControl fileCount={fileCount} dragActive={dragActive} onOpenPicker={onOpenPicker} scaled />
      </div>

      {WORKFLOW_ACTIONS.map((action) => (
        <WorkflowActionButton
          key={action.slug}
          action={action}
          selected={selectedAction === action.slug}
          loading={loadingAction === action.slug}
          onSelect={onSelectAction}
          scaled
        />
      ))}

      {/* Transient status floats over the lower paper stack, so the poster
          composition stays intact until there is something to report. It is
          bounded above the ribbon label so the two never collide. */}
      {(files.length > 0 || error) && (
        <div
          className="absolute flex flex-col overflow-y-auto"
          style={{
            left: d(614),
            top: d(556),
            width: d(344),
            maxHeight: d(226),
            gap: d(8),
            zIndex: LAYER.chrome,
          }}
        >
          {errorNode}
          <div className="rounded-xl shadow-[var(--shadow-paper)]">
            <FileQueue files={files} onRemove={onRemoveFile} onRetry={onRetryFile} compact />
          </div>
        </div>
      )}
    </>
  );
}
