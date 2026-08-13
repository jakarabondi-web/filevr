"use client";

import Link from "next/link";
import { FilevrIcon } from "@/components/ui/filevr-icon";
import { d, UTILITY } from "@/components/workbench/geometry";
import type { SessionUser } from "@/lib/auth";

interface UtilityBarProps {
  user: SessionUser | null;
  onNewWorkflow: () => void;
  onOpenSearch: () => void;
  /** Desktop renders inside the scaled composition; below 1280px it flows. */
  scaled?: boolean;
}

export function UtilityBar({ user, onNewWorkflow, onOpenSearch, scaled = false }: UtilityBarProps) {
  const s = (n: number) => (scaled ? d(n) : undefined);

  return (
    <div
      className={
        scaled
          ? "absolute flex items-center"
          : "flex flex-wrap items-center gap-3 px-5 pt-4 min-[480px]:px-7 lg:px-10"
      }
      style={
        scaled
          ? { top: d(UTILITY.top), right: d(UTILITY.right), gap: d(UTILITY.gap), height: d(UTILITY.height) }
          : undefined
      }
    >
      <button
        type="button"
        onClick={onNewWorkflow}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink font-medium text-white focus-ring max-xl:px-4 max-xl:py-2.5 max-xl:text-sm"
        style={scaled ? { width: s(UTILITY.newWidth), height: s(UTILITY.height), fontSize: s(18), gap: s(10) } : undefined}
      >
        <FilevrIcon
          name="plus"
          className="text-acid size-4"
          style={scaled ? { width: s(24), height: s(24) } : undefined}
          aria-hidden="true"
        />
        <span className="xl:hidden">New</span>
        <span className="max-xl:hidden">New workflow</span>
      </button>

      <button
        type="button"
        onClick={onOpenSearch}
        className="flex min-w-0 items-center gap-2.5 rounded-[18px] border border-ink/30 bg-paper-light/60 text-left text-ink/55 focus-ring max-xl:flex-1 max-xl:px-4 max-xl:py-2.5 max-xl:text-sm"
        style={scaled ? { width: s(UTILITY.searchWidth), height: s(UTILITY.height), paddingInline: s(18), gap: s(12), fontSize: s(18) } : undefined}
      >
        <FilevrIcon
          name="search"
          className="shrink-0 size-4"
          style={scaled ? { width: s(25), height: s(25) } : undefined}
          aria-hidden="true"
        />
        <span className="truncate">Search anything</span>
      </button>

      {user && user.plan === "free" && (
        <div
          className="flex shrink-0 flex-col justify-center gap-1.5 max-md:hidden"
          style={scaled ? { width: s(UTILITY.usageWidth) } : { width: 150 }}
        >
          <span
            className="font-semibold text-ink max-xl:text-xs"
            style={scaled ? { fontSize: s(16) } : undefined}
          >
            {user.usagePercent}% used
          </span>
          <div
            className="overflow-hidden rounded-full bg-ink max-xl:h-1.5"
            style={scaled ? { height: s(7) } : undefined}
            role="progressbar"
            aria-label="Free plan storage used"
            aria-valuenow={user.usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-acid" style={{ width: `${user.usagePercent}%` }} />
          </div>
        </div>
      )}

      <Link
        href="/pricing"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cobalt font-medium text-white transition-colors hover:bg-cobalt-hover focus-ring max-xl:px-4 max-xl:py-2.5 max-xl:text-sm"
        style={scaled ? { width: s(UTILITY.upgradeWidth), height: s(UTILITY.height), fontSize: s(18), gap: s(8) } : undefined}
      >
        <FilevrIcon
          name="bolt"
          className="size-4"
          style={scaled ? { width: s(23), height: s(23) } : undefined}
          aria-hidden="true"
        />
        Upgrade
      </Link>
    </div>
  );
}
