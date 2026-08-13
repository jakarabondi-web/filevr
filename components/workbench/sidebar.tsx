import Link from "next/link";
import { FilevrIcon } from "@/components/ui/filevr-icon";
import { NAV_ITEMS } from "@/components/workbench/data";
import type { SessionUser } from "@/lib/auth";

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-md text-white focus-ring"
      aria-label="Filevr home"
    >
      <FilevrIcon name="filevr-mark" className="size-[30px] shrink-0" />
      <span className="font-display text-2xl uppercase tracking-[0.01em]">Filevr</span>
    </Link>
  );
}

function SidebarNav({ user }: { user: SessionUser | null }) {
  const items = NAV_ITEMS.filter((item) => !item.authOnly || user);

  return (
    <nav aria-label="Sections" className="flex flex-col gap-11">
      {items.map((item) => {
        const active = item.href === "/";
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex w-[132px] flex-col gap-[18px] rounded-md focus-ring ${
              active ? "text-acid" : "text-white hover:text-acid"
            }`}
          >
            <FilevrIcon name={item.icon} className="size-8" aria-hidden="true" />
            <span className="text-lg leading-6 font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AccountControl({ user }: { user: SessionUser | null }) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex w-[104px] items-center justify-center rounded-full border border-white/25 py-2.5 text-sm font-medium text-white focus-ring"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/workspace/settings"
      className="flex items-center gap-2 rounded-full focus-ring"
      aria-label={`Account menu for ${user.name}`}
    >
      <span className="flex size-[54px] items-center justify-center rounded-full bg-acid text-xl font-semibold text-ink">
        {user.initials}
      </span>
      <FilevrIcon name="chevron-down" className="size-5 text-white" aria-hidden="true" />
    </Link>
  );
}

/** Full-height left rail. Hidden below 768px, where TopBar replaces it. */
export function Sidebar({ user }: { user: SessionUser | null }) {
  return (
    <aside
      aria-label="Primary"
      className="hidden shrink-0 flex-col bg-ink md:flex md:w-[76px] md:items-center md:px-0 xl:w-[152px] xl:items-start xl:px-0 2xl:w-[180px]"
    >
      <div className="flex flex-1 flex-col pt-7 max-xl:items-center xl:pl-[26px]">
        <div className="max-xl:[&_span]:hidden">
          <Brand />
        </div>
        {/* Brand sits at y=28 and is 30px tall, so 93px lands nav at y=151. */}
        <div className="mt-[93px] max-xl:[&_span]:sr-only max-xl:[&_a]:w-auto">
          <SidebarNav user={user} />
        </div>
      </div>
      <div className="pb-[27px] max-xl:self-center xl:pl-[26px]">
        <div className="mb-[27px] h-px w-[104px] bg-white/25 max-xl:w-10" />
        <AccountControl user={user} />
      </div>
    </aside>
  );
}
