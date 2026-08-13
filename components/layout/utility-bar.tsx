"use client";

import { Plus, Search, Zap } from "lucide-react";
import Link from "next/link";
import type { SessionUser } from "@/lib/auth";

export function UtilityBar({ user }: { user: SessionUser | null }) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 pt-5 sm:px-8 md:px-10">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-[14px] bg-ink px-5 py-3 text-[15px] font-semibold text-white focus-ring"
      >
        <Plus aria-hidden="true" className="size-5 text-lime" strokeWidth={3} />
        New workflow
      </button>

      <label className="relative flex min-w-[160px] flex-1 items-center md:max-w-[430px]">
        <span className="sr-only">Search anything</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 size-5 text-ink/50" strokeWidth={2.25} />
        <input
          type="search"
          placeholder="Search anything"
          className="w-full rounded-full border-[1.5px] border-ink/25 bg-white/50 py-3 pl-11 pr-4 text-[15px] text-ink placeholder:text-ink/45 focus-ring"
        />
      </label>

      <div className="ml-auto flex items-center gap-5">
        {user && user.plan === "free" && (
          <div className="hidden items-center gap-3 sm:flex" aria-label={`${user.usagePercent}% of free plan used`}>
            <span className="whitespace-nowrap text-[15px] font-semibold text-ink">{user.usagePercent}% used</span>
            <div
              className="h-2.5 w-40 overflow-hidden rounded-full bg-ink"
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
          className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover focus-ring"
        >
          <Zap aria-hidden="true" className="size-4" fill="currentColor" strokeWidth={0} />
          Upgrade
        </Link>
      </div>
    </div>
  );
}
