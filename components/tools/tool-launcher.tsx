"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/validation/file";
import type { ToolDefinition } from "@/types";
import { track } from "@/lib/analytics";

export function ToolLauncher({ tool }: { tool: ToolDefinition }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTask = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.errorMessage ?? "This file can't be used.");
        return;
      }
      setError(null);
      setIsStarting(true);
      track("upload_started");

      try {
        const uploadRes = await fetch("/api/uploads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size }),
        });
        if (!uploadRes.ok) throw new Error("upload_failed");
        const { fileId } = await uploadRes.json();

        await fetch(`/api/uploads/${fileId}/complete`, { method: "POST" });
        track("upload_completed");

        const jobRes = await fetch("/api/jobs", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "idempotency-key": `${fileId}-${tool.slug}`,
          },
          body: JSON.stringify({ toolSlug: tool.slug, inputFileIds: [fileId] }),
        });
        if (!jobRes.ok) throw new Error("job_failed");
        const { jobId } = await jobRes.json();
        track("job_started", { tool: tool.slug });

        router.push(`/task/${tool.slug}/${jobId}`);
      } catch {
        setError("We couldn't start this task. Check your connection and try again.");
        setIsStarting(false);
        track("upload_failed", { tool: tool.slug });
      }
    },
    [router, tool.slug]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void startTask(file);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-surface p-10 text-center transition-colors",
          isDragging && "border-drag-border bg-drag-bg"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={tool.acceptedExtensions.join(",")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void startTask(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isStarting}
          className="flex size-16 items-center justify-center rounded-full bg-lime text-lime-ink focus-ring disabled:opacity-60"
          aria-label={`Choose a file for ${tool.name}`}
        >
          {isStarting ? (
            <Loader2 aria-hidden="true" className="size-6 animate-spin" />
          ) : (
            <Upload aria-hidden="true" className="size-6" strokeWidth={2.5} />
          )}
        </button>
        <div>
          <p className="text-sm font-semibold text-text">
            {isStarting ? "Starting your task…" : `Drop a file to ${tool.shortName.toLowerCase()}, or choose one`}
          </p>
          <p className="mt-1 text-xs text-muted">{tool.acceptedExtensions.join(", ")}</p>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
