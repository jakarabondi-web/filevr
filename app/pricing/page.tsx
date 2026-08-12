import type { Metadata } from "next";
import { Check } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { FaqSection } from "@/components/marketing/faq-section";

export const metadata: Metadata = {
  title: "Pricing — Filevr",
  description: "Compare Filevr plans: Free, Pro, Team, and Business.",
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "",
    description: "Occasional use",
    features: ["3 tasks/day", "100 MB per file", "Standard queue", "Watermark on advanced editing exports"],
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/month",
    description: "Individuals",
    features: ["Unlimited standard tasks", "2 GB per task", "Priority processing", "OCR & batch tools", "No ads or watermarks"],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$20",
    cadence: "/user/month",
    description: "Small teams · 3-seat minimum",
    features: ["Shared workspace", "Templates", "Admin controls", "Consolidated billing", "Audit log"],
  },
  {
    name: "Business",
    price: "Custom",
    cadence: "",
    description: "Regulated / high-volume teams",
    features: ["SSO/SAML", "API access", "Custom retention", "Regional processing", "SLA"],
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8">
        <h1 className="text-3xl font-semibold text-text">Plans for every workflow</h1>
        <p className="mt-2 max-w-xl text-muted">
          Start free. Upgrade when you need larger files, priority processing, or team collaboration.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-6 ${
                plan.highlighted ? "border-2 border-primary bg-primary-soft" : "border-border bg-surface"
              }`}
            >
              <p className="text-sm font-semibold text-muted">{plan.name}</p>
              <p className="mt-1 text-2xl font-bold text-text">
                {plan.price}
                {plan.cadence && <span className="text-sm font-medium text-muted">{plan.cadence}</span>}
              </p>
              <p className="mt-1 text-xs text-muted">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <FaqSection />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
