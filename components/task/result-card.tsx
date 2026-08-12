"use client";

import Link from "next/link";
import { CheckCircle2, Download, RotateCcw, Upload as UploadIcon } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { track } from "@/lib/analytics";

export function ResultCard({
  filename,
  sizeBytes,
  onStartOver,
}: {
  filename: string;
  sizeBytes: number;
  onStartOver: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
      <CheckCircle2 aria-hidden="true" className="size-12 text-success" />
      <div>
        <p className="text-lg font-semibold text-text">Your file is ready</p>
        <p className="mt-1 text-sm text-muted">
          {filename} · {formatBytes(sizeBytes)}
        </p>
      </div>
      <a
        href="#"
        onClick={() => track("result_downloaded")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover focus-ring"
      >
        <Download aria-hidden="true" className="size-4" />
        Download
      </a>
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-primary focus-ring"
        >
          <UploadIcon aria-hidden="true" className="size-4" />
          Save to cloud
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-primary focus-ring"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Start over
        </button>
      </div>
      <Link href="/tools" className="text-sm font-medium text-primary hover:underline focus-ring rounded-sm">
        Run another tool
      </Link>
    </div>
  );
}
