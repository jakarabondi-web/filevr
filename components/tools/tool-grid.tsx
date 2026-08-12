import type { ToolDefinition } from "@/types";
import { ToolCard } from "@/components/tools/tool-card";

export function ToolGrid({ tools }: { tools: ToolDefinition[] }) {
  if (tools.length === 0) {
    return <p className="py-12 text-center text-sm text-muted">No tools match your search.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}
