"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, Plus } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

export function MobileNav({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
    else openButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="flex md:hidden items-center justify-between bg-ink px-4 py-3">
      <Link href="/" className="flex items-center gap-1.5 text-white focus-ring rounded-md" aria-label="Filevr home">
        <span className="flex size-6 items-center justify-center rounded-md bg-lime text-lime-ink font-black text-xs">F</span>
        <span className="text-sm font-black tracking-wide">FILEVR</span>
      </Link>
      <div className="flex items-center gap-2">
        <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1.5 text-xs font-semibold text-lime-ink focus-ring">
          <Plus aria-hidden="true" className="size-3.5" />
          New
        </button>
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="rounded-md p-1.5 text-white focus-ring"
          aria-label="Open menu"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink text-white"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-black tracking-wide">MENU</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 focus-ring"
              aria-label="Close menu"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-4 py-2" aria-label="Sections">
            {[
              { href: "/", label: "Home" },
              { href: user ? "/workspace" : "/tools", label: user ? "Workspace" : "Explore tools" },
              { href: "/tools", label: "Templates" },
              { href: "/pricing", label: "Pricing" },
              { href: user ? "/workspace/settings" : "/login", label: user ? "Account" : "Sign in" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium hover:bg-white/10 focus-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
