"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

  return (
    <div className="px-4 pb-8 pt-4 sm:px-8 md:px-10">
      <p className="mb-3 text-[17px] font-semibold text-ink">Continue where you left off</p>

      {user ? (
        <div className="flex flex-col rounded-2xl border-[1.5px] border-ink/20 bg-white/40 md:flex-row md:items-stretch">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-3 px-5 py-4",
                i > 0 && "border-t-[1.5px] border-ink/15 md:border-t-0 md:border-l-[1.5px]"
              )}
            >
              <Link
                href={`/task/compress-pdf/${item.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-ring"
              >
                <FileTypeIcon name={item.name} />
                <span className="min-w-0 flex-1 truncate text-[15.5px] font-semibold text-ink">{item.name}</span>
                <StatusDot status={item.status} className="size-3 shrink-0" />
              </Link>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                className="rounded-md p-1 text-ink/70 hover:text-ink focus-ring"
                aria-label={`Close ${item.name}`}
              >
                <X aria-hidden="true" className="size-5" strokeWidth={2.25} />
              </button>
            </div>
          ))}
          <Link
            href="/workspace/files"
            className="flex items-center justify-center border-t-[1.5px] border-ink/15 px-4 py-3 focus-ring md:border-t-0 md:border-l-[1.5px]"
            aria-label="See all files"
          >
            <span className="flex size-10 items-center justify-center rounded-full border-[1.5px] border-ink/50 text-ink">
              <ChevronRight aria-hidden="true" className="size-5" />
            </span>
          </Link>
        </div>
      ) : (
        <Link
          href="/login"
          className="flex w-full max-w-xl items-center justify-between rounded-2xl border-[1.5px] border-dashed border-ink/30 bg-white/40 px-5 py-4 text-[15.5px] font-semibold text-ink hover:bg-white/70 focus-ring"
        >
          Sign in to continue work across devices
          <ChevronRight aria-hidden="true" className="size-5" />
        </Link>
      )}
    </div>
  );
}
