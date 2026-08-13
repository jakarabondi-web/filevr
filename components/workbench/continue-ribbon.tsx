"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { FilevrIcon } from "@/components/ui/filevr-icon";
import { RECENT_DOCUMENTS, type RecentDocument } from "@/components/workbench/data";
import { d, RIBBON } from "@/components/workbench/geometry";

const DOT_COLOR: Record<RecentDocument["accent"], string> = {
  acid: "bg-acid",
  cobalt: "bg-cobalt",
  coral: "bg-coral",
};

interface ContinueRibbonProps {
  documents: RecentDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: (doc: RecentDocument) => void;
  scaled?: boolean;
}

export function ContinueRibbon({
  documents,
  selectedId,
  onSelect,
  onClose,
  scaled = false,
}: ContinueRibbonProps) {
  // Newest three stay visible; the arrow always leads to the full workspace.
  const visible = documents.slice(0, 3);
  const empty = visible.length === 0;

  return (
    <section
      aria-label="Recent documents"
      className={scaled ? "absolute" : "px-5 pb-8 pt-2 min-[480px]:px-7 lg:px-10"}
      style={
        scaled
          ? { left: d(RIBBON.left), right: d(RIBBON.right), bottom: d(RIBBON.bottom) }
          : undefined
      }
    >
      <h2
        className="font-semibold text-ink"
        style={scaled ? { fontSize: d(20), marginBottom: d(8) } : { fontSize: 17, marginBottom: 10 }}
      >
        Continue where you left off
      </h2>

      <div
        className={cn(
          "flex overflow-hidden rounded-[14px] border border-ink/65 bg-paper-light/50",
          !scaled && "max-md:flex-col"
        )}
        style={scaled ? { height: d(RIBBON.height) } : undefined}
      >
        {empty ? (
          <p
            className="flex flex-1 items-center text-ink/65 max-md:px-5 max-md:py-4"
            style={scaled ? { paddingInline: d(28), fontSize: d(20) } : { fontSize: 15 }}
          >
            Your finished documents will appear here
          </p>
        ) : (
          <>
            {visible.map((doc, i) => {
              const selected = doc.id === selectedId;
              return (
                <div
                  key={doc.id}
                  className={cn(
                    "flex min-w-0 flex-1 items-center transition-colors",
                    selected ? "bg-white/70" : "hover:bg-white/45",
                    i > 0 && "border-ink/35 max-md:border-t md:border-l"
                  )}
                  style={
                    scaled
                      ? { paddingInline: d(28), gap: d(16) }
                      : { paddingInline: 20, paddingBlock: 14, gap: 12 }
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSelect(doc.id)}
                    aria-pressed={selected}
                    title={doc.name}
                    className="flex min-w-0 flex-1 items-center rounded-md text-left focus-ring"
                    style={scaled ? { gap: d(16) } : { gap: 12 }}
                  >
                    <FilevrIcon
                      name={doc.icon}
                      className="shrink-0 text-ink size-7"
                      style={scaled ? { width: d(36), height: d(36) } : undefined}
                      aria-hidden="true"
                    />
                    <span
                      className="min-w-0 flex-1 truncate font-semibold text-ink"
                      style={scaled ? { fontSize: d(20) } : { fontSize: 15 }}
                    >
                      {doc.name}
                    </span>
                    <span
                      className={cn("shrink-0 rounded-full", DOT_COLOR[doc.accent])}
                      style={scaled ? { width: d(14), height: d(14) } : { width: 11, height: 11 }}
                      role="img"
                      aria-label={
                        doc.status === "completed"
                          ? "Completed"
                          : doc.status === "processing_failed"
                            ? "Failed"
                            : "Processing"
                      }
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onClose(doc)}
                    aria-label={`Close ${doc.name}`}
                    className="shrink-0 rounded-md p-1 text-ink/70 hover:text-ink focus-ring"
                  >
                    <FilevrIcon
                      name="close"
                      className="size-4"
                      style={scaled ? { width: d(20), height: d(20) } : undefined}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              );
            })}
          </>
        )}

        <Link
          href="/workspace/files"
          aria-label="See all files in your workspace"
          className="flex shrink-0 items-center justify-center border-ink/35 hover:bg-white/45 focus-ring max-md:border-t max-md:py-3 md:border-l"
          style={scaled ? { width: d(RIBBON.arrowWidth) } : { minWidth: 56 }}
        >
          <FilevrIcon
            name="arrow-right"
            className="text-ink size-5"
            style={scaled ? { width: d(24), height: d(24) } : undefined}
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}

export { RECENT_DOCUMENTS };
