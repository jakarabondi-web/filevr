import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Billing — Filevr" };

export default async function BillingPage() {
  const user = await getSessionUser();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold text-text">Billing</h1>
      <p className="mt-1 text-muted">Manage your plan, usage, and invoices.</p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="text-sm font-medium text-muted">Current plan</p>
        <p className="mt-1 text-xl font-semibold capitalize text-text">{user?.plan ?? "Free"}</p>
        {user?.plan === "free" && (
          <p className="mt-1 text-sm text-muted">{user.usagePercent}% of your daily limit used.</p>
        )}
        <Link
          href="/pricing"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-ring"
        >
          Compare plans
        </Link>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Invoices</p>
        <p className="mt-2 text-sm text-muted">No invoices yet.</p>
      </div>
    </div>
  );
}
