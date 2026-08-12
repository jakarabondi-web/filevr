import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

export const metadata: Metadata = { title: "Terms — Filevr" };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-14 sm:px-8">
        <h1 className="text-3xl font-semibold text-text">Terms of service</h1>
        <p className="mt-4 text-sm text-muted">
          This page is a placeholder. Publish reviewed terms before launch — see spec section 15 for legal review
          requirements.
        </p>
      </main>
      <AppFooter />
    </div>
  );
}
