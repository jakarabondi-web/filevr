import Link from "next/link";
import { TOOL_CATEGORIES } from "@/config/tools";

export function CategoryExplorer() {
  return (
    <section aria-labelledby="categories-heading" className="px-4 py-14 sm:px-8 md:px-10">
      <h2 id="categories-heading" className="text-2xl font-semibold text-text sm:text-[36px] sm:leading-[44px]">
        Every job, organized
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TOOL_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/tools?category=${encodeURIComponent(category)}`}
            className="rounded-xl border border-border bg-surface p-4 text-sm font-semibold text-text shadow-[var(--shadow-card)] transition-colors hover:border-primary focus-ring"
          >
            {category}
          </Link>
        ))}
      </div>
    </section>
  );
}
