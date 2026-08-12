"use client";

import { cn } from "@/lib/utils";
import { ToolIcon } from "@/components/ui/tool-icon";
import type { ToolDefinition } from "@/types";

const ACCENT_CLASSES: Record<ToolDefinition["accent"], string> = {
  lime: "bg-lime text-lime-ink",
  indigo: "bg-primary text-white",
  coral: "bg-[#ff5a4e] text-white",
  sky: "bg-sky-500 text-white",
};

const CONNECTOR_DOT: Record<ToolDefinition["accent"], string> = {
  lime: "var(--lime)",
  indigo: "var(--primary)",
  coral: "#ff5a4e",
  sky: "#0ea5e9",
};

function Connector({ side, color }: { side: "left" | "right"; color: string }) {
  const flip = side === "left";
  return (
    <svg
      width="40"
      height="28"
      viewBox="0 0 40 28"
      fill="none"
      aria-hidden="true"
      className={cn("hidden lg:block shrink-0", flip && "scale-x-[-1]")}
    >
      <path
        d="M2 14C14 14 18 4 38 4"
        stroke="var(--ink)"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="38" cy="4" r="3.5" fill={color} stroke="var(--ink)" strokeOpacity="0.55" />
    </svg>
  );
}

export function ActionChip({
  tool,
  side,
  recommended,
  onSelect,
}: {
  tool: ToolDefinition;
  side: "left" | "right";
  recommended?: boolean;
  onSelect: (tool: ToolDefinition) => void;
}) {
  return (
    <div className={cn("flex items-center gap-0", side === "right" && "flex-row-reverse")}>
      <Connector side={side === "left" ? "right" : "left"} color={CONNECTOR_DOT[tool.accent]} />
      <button
        type="button"
        onClick={() => onSelect(tool)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 focus-ring",
          ACCENT_CLASSES[tool.accent],
          recommended && "ring-2 ring-offset-2 ring-offset-paper ring-ink"
        )}
        aria-label={`${tool.shortName}: ${tool.description}`}
      >
        <ToolIcon name={tool.icon} className="size-4" strokeWidth={2} aria-hidden="true" />
        {tool.shortName}
      </button>
    </div>
  );
}
