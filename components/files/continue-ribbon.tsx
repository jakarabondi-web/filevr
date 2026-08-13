"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal, X } from "lucide-react";
import { StatusDot } from "@/components/ui/status-badge";
import { FileTypeIcon } from "@/components/files/file-type-icon";
import type { JobStatus } from "@/types";
import type { SessionUser } from "@/lib/auth";

interface RecentItem {
  id: string;
  name: string;
  status: JobStatus;
}

const MOCK_RECENT: RecentItem[] = [
  { id: "job_1", name: "Proposal.pdf", status: "completed" },
  { id: "job_2", name: "Contract.docx", status: "processing" },
  { id: "job_3", name: "Invoice scan", status: "processing_failed" },
];

export function ContinueRibbon({ user }: { user: SessionUser | null }) {
  const [items, setItems] = useState(MOCK_RECENT);

  if (!user) {
    return (
      <div className="border-t border-black/10 bg-paper-texture/40 px-4 py-4 sm:px-8 md:px-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">Continue where you left off</p>
        <Link
          href="/login"
          className="inline-flex w-full max-w-md items-center justify-between rounded-xl border border-dashed border-ink/25 bg-white/60 px-4 py-3 text-sm font-medium text-ink hover:bg-white focus-ring"
        >
          Sign in to continue work across devices
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-black/10 bg-paper-texture/40 px-4 py-4 sm:px-8 md:px-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">Continue where you left off</p>
      <div className="flex flex-wrap items-stretch gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 shadow-[var(--shadow-card)]"
          >
            <Link href={`/task/compress-pdf/${item.id}`} className="flex min-w-0 flex-1 items-center gap-2.5 focus-ring rounded-md">
              <FileTypeIcon name={item.name} />
              <span className="truncate text-sm font-medium text-ink">{item.name}</span>
              <StatusDot status={item.status} className="ml-1 shrink-0" />
            </Link>
            <button
              type="button"
              className="rounded-md p-1 text-muted opacity-0 hover:text-text focus-ring group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`More options for ${item.name}`}
            >
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
              className="rounded-md p-1 text-muted hover:text-text focus-ring"
              aria-label={`Close ${item.name}`}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        ))}
        <Link
          href="/workspace/files"
          className="flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-ink shadow-[var(--shadow-card)] focus-ring"
          aria-label="See all files"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </div>
  );
}
