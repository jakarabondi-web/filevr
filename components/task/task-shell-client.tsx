"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { TaskStepper } from "@/components/task/task-stepper";
import { ProcessingProgress } from "@/components/task/processing-progress";
import { ResultCard } from "@/components/task/result-card";
import type { ToolDefinition, JobStatus } from "@/types";
import { track } from "@/lib/analytics";

interface JobStatusResponse {
  status: JobStatus;
  progress: number;
  errorMessage?: string;
  outputs?: { id: string; name: string; sizeBytes: number; downloadUrl?: string }[];
}

const STEPS = [
  { key: "select", label: "Select" },
  { key: "processing", label: "Process" },
  { key: "completed", label: "Result" },
];

export function TaskShellClient({ tool, jobId }: { tool: ToolDefinition; jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("not_found");
        const data: JobStatusResponse = await res.json();
        if (cancelled) return;
        setJob(data);
        attemptRef.current = 0;

        if (data.status === "completed") {
          track("job_completed", { tool: tool.slug });
          return;
        }
        if (data.status === "processing_failed") {
          track("job_failed", { tool: tool.slug });
          return;
        }
        timer = setTimeout(poll, 800);
      } catch {
        attemptRef.current += 1;
        const backoff = Math.min(8000, 800 * 2 ** attemptRef.current);
        timer = setTimeout(poll, backoff);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, tool.slug]);

  const status = job?.status ?? "processing";
  const currentStepKey = status === "completed" ? "completed" : "processing";
  const output = job?.outputs?.[0];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-black tracking-wide text-ink">
            FILEVR
          </Link>
          <span className="text-sm text-muted">/</span>
          <h1 className="text-sm font-semibold text-text">{tool.name}</h1>
        </div>
        <button type="button" className="rounded-md p-1.5 text-muted hover:text-text focus-ring" aria-label="Help">
          <HelpCircle aria-hidden="true" className="size-5" />
        </button>
      </header>

      <div className="flex justify-center border-b border-border py-5">
        <TaskStepper steps={STEPS} currentKey={currentStepKey} />
      </div>

      <main className="flex flex-1 items-center justify-center py-8">
        {status === "processing_failed" ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
            <AlertTriangle aria-hidden="true" className="size-10 text-danger" />
            <p className="text-lg font-semibold text-text">We couldn&apos;t finish this task</p>
            <p className="text-sm text-muted">{job?.errorMessage ?? "Your original file is unchanged. Retry or choose another tool."}</p>
            <Link
              href={`/tools/${tool.slug}`}
              className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-ring"
            >
              Retry
            </Link>
          </div>
        ) : status === "completed" && output ? (
          <ResultCard
            filename={output.name}
            sizeBytes={output.sizeBytes}
            downloadUrl={output.downloadUrl}
            onStartOver={() => router.push(`/tools/${tool.slug}`)}
          />
        ) : (
          <ProcessingProgress progress={job?.progress ?? 0} label={`${tool.name} in progress`} />
        )}
      </main>
    </div>
  );
}
