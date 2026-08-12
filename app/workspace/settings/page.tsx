import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings — Filevr" };

export default async function SettingsPage() {
  const user = await getSessionUser();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold text-text">Settings</h1>
      <p className="mt-1 text-muted">Profile, storage, and account deletion.</p>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
          Name
          <input
            defaultValue={user?.name}
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm focus-ring"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
          Email
          <input
            defaultValue={user?.email}
            type="email"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm focus-ring"
          />
        </label>
        <button
          type="button"
          className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-ring"
        >
          Save changes
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-danger/30 bg-surface p-6">
        <p className="text-sm font-semibold text-danger">Delete account</p>
        <p className="mt-1 text-sm text-muted">Permanently deletes your account and all stored files.</p>
        <button
          type="button"
          className="mt-3 rounded-full border border-danger px-5 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5 focus-ring"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
