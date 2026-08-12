import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Tools", href: "/tools" },
      { label: "Pricing", href: "/pricing" },
      { label: "Workspace", href: "/workspace" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Language",
    links: [{ label: "English (US)", href: "/" }],
  },
];

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-surface px-4 py-10 sm:px-8 md:px-10">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-text hover:text-primary focus-ring rounded-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-10 text-xs text-muted">© {new Date().getFullYear()} Filevr. All rights reserved.</p>
    </footer>
  );
}
