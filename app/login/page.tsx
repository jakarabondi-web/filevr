import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = { title: "Sign in — Filevr" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader />
      <main id="main" className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
        <h1 className="text-2xl font-semibold text-text">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Save your history and reuse signatures across devices.</p>
        <form className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm focus-ring"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-ring"
          >
            Send magic link
          </button>
        </form>
        <button
          type="button"
          className="mt-3 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text hover:border-primary focus-ring"
        >
          Continue with Google
        </button>
        <p className="mt-6 text-sm text-muted">
          New to Filevr?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline focus-ring rounded-sm">
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}
