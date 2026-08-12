"use client";

import { cn } from "@/lib/utils";
import { ToolIcon } from "@/components/ui/tool-icon";
import type { ToolDefinition } from "@/types";

const ACCENT_CLASSES: Record<ToolDefinition["accent"], string> = {
  lime: "bg-lime text-lime-ink",
  indigo: "bg-primary text-white",
  coral: "bg-coral text-white",
  sky: "bg-sky-500 text-white",
};

const ACCENT_SHADOW: Record<ToolDefinition["accent"], string> = {
  lime: "0 10px 22px -8px rgba(184,219,30,0.55)",
  indigo: "0 10px 22px -8px rgba(79,70,229,0.45)",
  coral: "0 10px 22px -8px rgba(255,90,69,0.45)",
  sky: "0 10px 22px -8px rgba(14,165,233,0.45)",
};

const CONNECTOR_DOT: Record<ToolDefinition["accent"], string> = {
  lime: "var(--lime)",
  indigo: "var(--primary)",
  coral: "var(--coral)",
  sky: "#0ea5e9",
};

function Connector({ side, color }: { side: "left" | "right"; color: string }) {
  const flip = side === "left";
  return (
    <svg
      width="44"
      height="30"
      viewBox="0 0 44 30"
      fill="none"
      aria-hidden="true"
      className={cn("hidden lg:block shrink-0", flip && "scale-x-[-1]")}
    >
      <path
        d="M2 15C16 15 20 4 42 4"
        stroke="var(--ink)"
        strokeOpacity="0.5"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="42" cy="4" r="4" fill={color} stroke="var(--ink)" strokeOpacity="0.5" />
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
        style={{ boxShadow: ACCENT_SHADOW[tool.accent] }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 focus-ring",
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
