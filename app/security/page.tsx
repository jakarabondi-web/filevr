import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { TrustSection } from "@/components/marketing/trust-section";

export const metadata: Metadata = { title: "Security — Filevr" };

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-14 sm:px-8">
        <h1 className="text-3xl font-semibold text-text">Security</h1>
        <p className="mt-4 max-w-xl text-muted">
          Filevr sandboxes every conversion, validates files by signature rather than trusting extensions, and
          issues short-lived signed URLs for storage access.
        </p>
        <div className="mt-8">
          <TrustSection />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
