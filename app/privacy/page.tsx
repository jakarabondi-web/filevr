import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

export const metadata: Metadata = { title: "Privacy — Filevr" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-14 sm:px-8">
        <h1 className="text-3xl font-semibold text-text">Privacy</h1>
        <p className="mt-4 text-muted">
          Filevr encrypts files in transit and at rest, and deletes them automatically according to your plan&apos;s
          retention policy. We do not train models on customer documents by default.
        </p>
        <p className="mt-4 text-sm text-muted">
          This page is a placeholder. Publish a reviewed privacy policy before launch — see spec section 15.
        </p>
      </main>
      <AppFooter />
    </div>
  );
}
