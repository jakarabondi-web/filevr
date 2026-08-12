import Link from "next/link";
import { Check } from "lucide-react";

const FREE_FEATURES = ["3 tasks per day", "100 MB per file", "Standard queue"];
const PRO_FEATURES = ["Unlimited standard tasks", "2 GB per task", "Priority processing", "No ads or watermarks"];

export function PricingPreview() {
  return (
    <section aria-labelledby="pricing-heading" className="bg-surface px-4 py-14 sm:px-8 md:px-10">
      <h2 id="pricing-heading" className="text-2xl font-semibold text-text sm:text-[36px] sm:leading-[44px]">
        Free to start. Pro when you need more.
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm font-semibold text-muted">Free</p>
          <p className="mt-1 text-3xl font-bold text-text">$0</p>
          <ul className="mt-4 space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-text">
                <Check aria-hidden="true" className="size-4 text-success" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-primary bg-primary-soft p-6">
          <p className="text-sm font-semibold text-primary">Pro</p>
          <p className="mt-1 text-3xl font-bold text-text">
            $12<span className="text-base font-medium text-muted">/month</span>
          </p>
          <ul className="mt-4 space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-text">
                <Check aria-hidden="true" className="size-4 text-success" /> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-ring"
          >
            See full plan comparison
          </Link>
        </div>
      </div>
    </section>
  );
}
