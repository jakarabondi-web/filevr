"use client";

import Link from "next/link";
import { useState } from "react";
import { FilevrIcon } from "@/components/ui/filevr-icon";
import { NAV_ITEMS } from "@/components/workbench/data";
import type { SessionUser } from "@/lib/auth";

/** Sticky header replacing the sidebar below 768px. */
export function TopBar({
  user,
  onNewWorkflow,
  onOpenSearch,
}: {
  user: SessionUser | null;
  onNewWorkflow: () => void;
  onOpenSearch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items = NAV_ITEMS.filter((item) => !item.authOnly || user);

  return (
    <header className="sticky top-0 z-50 bg-ink md:hidden">
      <div className="flex h-16 items-center gap-3 px-5">
        <Link href="/" className="flex items-center gap-2 rounded-md text-white focus-ring" aria-label="Filevr home">
          <FilevrIcon name="filevr-mark" className="size-7 shrink-0" />
          <span className="font-display text-xl uppercase">Filevr</span>
        </Link>

        <button
          type="button"
          onClick={onNewWorkflow}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-acid px-3.5 py-2 text-sm font-semibold text-ink focus-ring"
        >
          <FilevrIcon name="plus" className="size-4" aria-hidden="true" />
          New
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-11 items-center justify-center rounded-md text-white focus-ring"
        >
          <FilevrIcon name={open ? "close" : "more"} className="size-6" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Sections" className="flex flex-col border-t border-white/15 px-5 pb-4">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenSearch();
            }}
            className="flex min-h-11 items-center gap-3 py-2.5 text-base font-medium text-white focus-ring"
          >
            <FilevrIcon name="search" className="size-5" aria-hidden="true" />
            Search tools
          </button>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-3 py-2.5 text-base font-medium text-white focus-ring"
            >
              <FilevrIcon name={item.icon} className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <Link
            href={user ? "/workspace/settings" : "/login"}
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 border-t border-white/15 pt-3 text-base font-medium text-white focus-ring"
          >
            {user ? (
              <>
                <span className="flex size-7 items-center justify-center rounded-full bg-acid text-xs font-bold text-ink">
                  {user.initials}
                </span>
                {user.name}
              </>
            ) : (
              "Sign in"
            )}
          </Link>
        </nav>
      )}
    </header>
  );
}
