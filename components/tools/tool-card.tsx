import Link from "next/link";
import { ToolIcon } from "@/components/ui/tool-icon";
import type { ToolDefinition } from "@/types";
import { cn } from "@/lib/utils";

const ACCENT_BG: Record<ToolDefinition["accent"], string> = {
  lime: "bg-lime text-lime-ink",
  indigo: "bg-primary text-white",
  coral: "bg-[#ff5a4e] text-white",
  sky: "bg-sky-500 text-white",
};

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary focus-ring"
    >
      <span className={cn("flex size-10 items-center justify-center rounded-full", ACCENT_BG[tool.accent])}>
        <ToolIcon name={tool.icon} className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-text group-hover:text-primary">{tool.name}</p>
        <p className="mt-1 text-xs text-muted">{tool.description}</p>
      </div>
      <span className="mt-auto text-[11px] font-medium uppercase tracking-wide text-muted">{tool.category}</span>
    </Link>
  );
}
