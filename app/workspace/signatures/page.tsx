import type { Metadata } from "next";
import { PenLine } from "lucide-react";

export const metadata: Metadata = { title: "Signatures — Filevr" };

export default function SignaturesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold text-text">Saved signatures</h1>
      <p className="mt-1 text-muted">Reuse a drawn, typed, or uploaded signature across documents.</p>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <PenLine aria-hidden="true" className="size-8 text-muted" />
        <p className="text-sm font-medium text-text">No saved signatures yet</p>
        <p className="text-sm text-muted">Add one the next time you sign a document.</p>
      </div>
    </div>
  );
}
