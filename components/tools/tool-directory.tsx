"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES } from "@/config/tools";
import { ToolGrid } from "@/components/tools/tool-grid";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types";

export function ToolDirectory({ initialCategory }: { initialCategory?: ToolCategory }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "All">(initialCategory ?? "All");

  const filtered = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory = category === "All" || tool.category === category;
      const matchesQuery =
        query.trim() === "" ||
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div>
      <label className="relative flex max-w-md items-center">
        <span className="sr-only">Search tools</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 size-4 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools"
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus-ring"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => setCategory("All")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium focus-ring",
            category === "All" ? "border-primary bg-primary-soft text-primary" : "border-border text-muted"
          )}
        >
          All
        </button>
        {TOOL_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium focus-ring",
              category === c ? "border-primary bg-primary-soft text-primary" : "border-border text-muted"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <ToolGrid tools={filtered} />
      </div>
    </div>
  );
}
