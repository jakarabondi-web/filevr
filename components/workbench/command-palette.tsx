"use client";

import { useId, useMemo, useState } from "react";
import { FilevrIcon } from "@/components/ui/filevr-icon";
import { WORKFLOW_ACTIONS, type WorkflowAction } from "@/components/workbench/data";

interface CommandPaletteProps {
  onClose: () => void;
  onRun: (action: WorkflowAction) => void;
}

/** Mounted only while open, so it always starts from a clean query. */
export function CommandPalette({ onClose, onRun }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORKFLOW_ACTIONS;
    return WORKFLOW_ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [query]);

  // Clamp during render rather than resetting from an effect.
  const active = Math.min(activeIndex, Math.max(results.length - 1, 0));
  const activeId = results[active] ? `${listId}-${results[active].slug}` : undefined;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-ink/45 px-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-ink/20 bg-paper-light shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(Math.min(active + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(Math.max(active - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            onRun(results[active]);
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-ink/15 px-4 py-3.5">
          <FilevrIcon name="search" className="size-5 shrink-0 text-ink/60" aria-hidden="true" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search tools"
            aria-label="Search tools"
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink/45"
          />
          <kbd className="shrink-0 rounded border border-ink/25 px-1.5 py-0.5 text-[11px] text-ink/55">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label="Tools" className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-ink/60">No tools match “{query}”.</li>
          )}
          {results.map((action, i) => (
            <li key={action.slug} id={`${listId}-${action.slug}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onClick={() => onRun(action)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left focus-ring ${
                  i === active ? "bg-ink/8" : ""
                }`}
              >
                <FilevrIcon name={action.icon} className="size-5 shrink-0 text-ink" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{action.label}</span>
                  <span className="block truncate text-xs text-ink/60">{action.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
