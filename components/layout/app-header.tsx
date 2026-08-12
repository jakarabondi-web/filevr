import Link from "next/link";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-8">
      <Link href="/" className="flex items-center gap-1.5 text-ink focus-ring rounded-md" aria-label="Filevr home">
        <span className="flex size-7 items-center justify-center rounded-md bg-lime text-lime-ink font-black text-sm">F</span>
        <span className="text-sm font-black tracking-wide">FILEVR</span>
      </Link>
      <nav aria-label="Utility" className="flex items-center gap-4 text-sm font-medium text-text">
        <Link href="/tools" className="hover:text-primary focus-ring rounded-sm">
          Tools
        </Link>
        <Link href="/pricing" className="hover:text-primary focus-ring rounded-sm">
          Pricing
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-primary px-4 py-2 text-white hover:bg-primary-hover focus-ring"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}
