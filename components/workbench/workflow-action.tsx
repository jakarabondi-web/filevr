"use client";

import { cn } from "@/lib/utils";
import { FilevrIcon } from "@/components/ui/filevr-icon";
import { ACCENT_SURFACE, ACTION_HEIGHT, type WorkflowAction as Action } from "@/components/workbench/data";
import { d, LAYER } from "@/components/workbench/geometry";

interface WorkflowActionButtonProps {
  action: Action;
  selected: boolean;
  loading: boolean;
  disabled?: boolean;
  onSelect: (action: Action) => void;
  /** Desktop places the pill absolutely at its reference coordinates. */
  scaled?: boolean;
}

export function WorkflowActionButton({
  action,
  selected,
  loading,
  disabled,
  onSelect,
  scaled = false,
}: WorkflowActionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(action)}
      disabled={disabled || loading}
      aria-pressed={selected}
      aria-label={`${action.label}: ${action.description}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        "transition-[transform,background-color] duration-[140ms] ease-out",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        ACCENT_SURFACE[action.accent],
        !disabled && !loading && "hover:-translate-y-0.5",
        selected && "ring-[3px] ring-inset ring-ink",
        (disabled || loading) && "cursor-not-allowed opacity-45 hover:translate-y-0",
        scaled ? "absolute" : "min-h-[52px] flex-1 gap-2 px-4 py-3 text-[15px]"
      )}
      style={
        scaled
          ? {
              left: d(action.x),
              top: d(action.y),
              width: d(action.width),
              height: d(ACTION_HEIGHT),
              paddingInline: d(26),
              gap: d(12),
              fontSize: d(24),
              zIndex: LAYER.action,
              boxShadow: "0 8px 18px rgba(16, 23, 19, 0.18)",
            }
          : undefined
      }
    >
      {loading ? (
        <span
          role="status"
          aria-label={`${action.label} in progress`}
          className="action-spinner shrink-0 rounded-full border-2 border-current border-t-transparent"
          style={scaled ? { width: d(33), height: d(33) } : { width: 20, height: 20 }}
        />
      ) : (
        <FilevrIcon
          name={action.icon}
          className={scaled ? "shrink-0" : "size-5 shrink-0"}
          style={scaled ? { width: d(33), height: d(33) } : undefined}
          aria-hidden="true"
        />
      )}
      {action.label}
    </button>
  );
}
