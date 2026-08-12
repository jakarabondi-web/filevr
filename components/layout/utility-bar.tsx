"use client";

import { Plus, Search, Zap } from "lucide-react";
import Link from "next/link";
import type { SessionUser } from "@/lib/auth";

export function UtilityBar({ user }: { user: SessionUser | null }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 pt-4 sm:px-8 sm:pt-6 md:px-10">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-lime focus-ring"
      >
        <Plus aria-hidden="true" className="size-4" />
        New workflow
      </button>

      <label className="relative flex min-w-[160px] flex-1 items-center">
        <span className="sr-only">Search anything</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 size-4 text-muted" />
        <input
          type="search"
          placeholder="Search anything"
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus-ring"
        />
      </label>

      <div className="ml-auto flex items-center gap-3">
        {user && user.plan === "free" && (
          <div className="hidden items-center gap-2 sm:flex" aria-label={`${user.usagePercent}% of free plan used`}>
            <span className="text-xs font-medium text-muted whitespace-nowrap">{user.usagePercent}% used</span>
            <div
              className="h-1.5 w-24 overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-valuenow={user.usagePercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-lime" style={{ width: `${user.usagePercent}%` }} />
            </div>
          </div>
        )}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors focus-ring"
        >
          <Zap aria-hidden="true" className="size-4" />
          Upgrade
        </Link>
      </div>
    </div>
  );
}
