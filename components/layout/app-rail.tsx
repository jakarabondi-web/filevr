import Link from "next/link";
import { Home, Folder, FileText, Compass, ChevronDown, LogIn } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

const NAV_ITEM_CLASS =
  "flex flex-col items-center gap-2 rounded-md py-1 text-[13.5px] font-semibold text-white/80 transition-colors hover:text-lime focus-ring";

/** Angular lime "F" mark from the reference wordmark. */
function LogoMark() {
  return (
    <svg viewBox="0 0 26 30" className="h-8 w-auto" aria-hidden="true">
      <path d="M3 1h20l-5 7h-7v4h10l-5 7h-5v10H3z" fill="var(--lime)" />
    </svg>
  );
}

export function AppRail({ user }: { user: SessionUser | null }) {
  return (
    <aside
      aria-label="Primary"
      className="hidden shrink-0 flex-col items-center justify-between bg-ink px-3 py-7 md:flex md:w-38 lg:w-[152px]"
    >
      <div className="flex w-full flex-col items-center gap-12">
        <Link href="/" className="flex items-center gap-2 rounded-md text-white focus-ring" aria-label="Filevr home">
          <LogoMark />
          <span className="text-[17px] font-black tracking-[0.02em]">FILEVR</span>
        </Link>

        <nav className="flex w-full flex-col items-center gap-9" aria-label="Sections">
          <Link href="/" className={`${NAV_ITEM_CLASS} text-lime hover:text-lime`}>
            <Home aria-hidden="true" className="size-6" fill="currentColor" strokeWidth={1.5} />
            Home
          </Link>
          {user ? (
            <Link href="/workspace" className={NAV_ITEM_CLASS}>
              <Folder aria-hidden="true" className="size-6" strokeWidth={2} />
              Workspace
            </Link>
          ) : (
            <Link href="/tools" className={NAV_ITEM_CLASS}>
              <Compass aria-hidden="true" className="size-6" strokeWidth={2} />
              Explore tools
            </Link>
          )}
          <Link href="/tools" className={NAV_ITEM_CLASS}>
            <FileText aria-hidden="true" className="size-6" strokeWidth={2} />
            Templates
          </Link>
        </nav>
      </div>

      <div className="w-full">
        <div className="mx-auto mb-5 h-px w-12 bg-white/25" />
        {user ? (
          <Link
            href="/workspace/settings"
            className="flex w-full items-center justify-center gap-1.5 rounded-full focus-ring"
            aria-label={`Account: ${user.name}`}
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-lime text-sm font-bold text-lime-ink">
              {user.initials}
            </span>
            <ChevronDown aria-hidden="true" className="size-4 text-white/70" strokeWidth={2.5} />
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/20 py-2 text-xs font-medium text-white focus-ring"
          >
            <LogIn aria-hidden="true" className="size-3.5" />
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
