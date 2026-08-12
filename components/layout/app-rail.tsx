import Link from "next/link";
import { Home, FolderKanban, LayoutTemplate, Compass, ChevronDown, LogIn } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

const NAV_ITEM_CLASS =
  "flex flex-col items-center gap-1.5 text-xs font-medium text-white/70 hover:text-lime transition-colors focus-ring rounded-md py-1";

export function AppRail({ user }: { user: SessionUser | null }) {
  return (
    <aside
      aria-label="Primary"
      className="hidden md:flex md:w-38 lg:w-[152px] shrink-0 flex-col items-center justify-between bg-ink py-6 px-3"
    >
      <div className="flex w-full flex-col items-center gap-10">
        <Link href="/" className="flex items-center gap-1.5 text-white focus-ring rounded-md" aria-label="Filevr home">
          <span className="flex size-7 items-center justify-center rounded-md bg-lime text-lime-ink font-black text-sm">
            F
          </span>
          <span className="text-sm font-black tracking-wide">FILEVR</span>
        </Link>

        <nav className="flex w-full flex-col items-center gap-7" aria-label="Sections">
          <Link href="/" className={`${NAV_ITEM_CLASS} text-lime`}>
            <Home aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Home
          </Link>
          {user ? (
            <Link href="/workspace" className={NAV_ITEM_CLASS}>
              <FolderKanban aria-hidden="true" className="size-5" strokeWidth={1.75} />
              Workspace
            </Link>
          ) : (
            <Link href="/tools" className={NAV_ITEM_CLASS}>
              <Compass aria-hidden="true" className="size-5" strokeWidth={1.75} />
              Explore tools
            </Link>
          )}
          <Link href="/tools" className={NAV_ITEM_CLASS}>
            <LayoutTemplate aria-hidden="true" className="size-5" strokeWidth={1.75} />
            Templates
          </Link>
        </nav>
      </div>

      <div className="w-full border-t border-white/10 pt-4">
        {user ? (
          <Link
            href="/workspace/settings"
            className="flex w-full items-center justify-center gap-1 rounded-full focus-ring"
            aria-label={`Account: ${user.name}`}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-lime text-xs font-bold text-lime-ink">
              {user.initials}
            </span>
            <ChevronDown aria-hidden="true" className="size-4 text-white/50" />
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
