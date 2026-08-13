"use client";

import { cn } from "@/lib/utils";
import { FilevrIcon } from "@/components/ui/filevr-icon";
import { d, DROP } from "@/components/workbench/geometry";
import { SUPPORTED_FORMATS_LABEL } from "@/components/workbench/data";

interface DropControlProps {
  fileCount: number;
  dragActive: boolean;
  onOpenPicker: () => void;
  /** Desktop renders at reference size; mobile uses the smaller variant. */
  scaled?: boolean;
}

export function DropControl({ fileCount, dragActive, onOpenPicker, scaled = false }: DropControlProps) {
  const ready = fileCount > 0;
  const lines = ready ? [`${fileCount} FILES`, "READY"] : ["DROP", "FILES"];

  return (
    <button
      type="button"
      onClick={onOpenPicker}
      aria-label={`Choose files to upload. Supported types: ${SUPPORTED_FORMATS_LABEL}`}
      className={cn(
        "drop-control group relative flex flex-col items-center rounded-full border-2 border-ink bg-acid text-ink",
        "transition-[transform,background-color,box-shadow] duration-150 ease-out",
        "hover:-translate-y-[3px] hover:bg-acid-hover active:translate-y-px active:duration-[90ms]",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-cobalt focus-visible:ring-offset-[3px] focus-visible:ring-offset-paper",
        dragActive && "drop-control--drag scale-[1.04] bg-acid-hover",
        !scaled && "size-[156px] justify-center gap-1"
      )}
      style={
        scaled
          ? {
              width: d(DROP.size),
              height: d(DROP.size),
              paddingTop: d(DROP.iconTop),
              gap: d(12),
              boxShadow: "var(--shadow-paper)",
            }
          : { boxShadow: "var(--shadow-paper)" }
      }
    >
      {/* Two offset ink rings give the printed/stamped edge. */}
      <span
        aria-hidden="true"
        className="drop-control__ring pointer-events-none absolute rounded-full border-2 border-ink/85"
        style={{ inset: scaled ? d(9) : "8px" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border border-ink/45"
        style={{ inset: scaled ? d(15) : "13px" }}
      />

      <FilevrIcon
        name="upload"
        className={scaled ? undefined : "size-9"}
        style={scaled ? { width: d(DROP.iconSize), height: d(DROP.iconSize) } : undefined}
        aria-hidden="true"
      />
      <span
        className="text-center font-bold leading-none"
        style={scaled ? { fontSize: d(31), lineHeight: d(32) } : { fontSize: 23, lineHeight: "24px" }}
      >
        {lines[0]}
        <br />
        {lines[1]}
      </span>
    </button>
  );
}
