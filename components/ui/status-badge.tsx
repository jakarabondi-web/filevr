import { cn } from "@/lib/utils";
import type { JobStatus } from "@/types";
import { Check, Clock, Loader2, X, AlertTriangle, ScanText } from "lucide-react";

const STATUS_META: Record<
  JobStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  draft: { label: "Draft", icon: Clock, className: "text-muted" },
  uploading: { label: "Uploading", icon: Loader2, className: "text-primary" },
  uploaded: { label: "Uploaded", icon: Check, className: "text-primary" },
  configured: { label: "Ready", icon: Check, className: "text-primary" },
  queued: { label: "Queued", icon: Clock, className: "text-muted" },
  processing: { label: "Processing", icon: Loader2, className: "text-primary" },
  completed: { label: "Completed", icon: Check, className: "text-success" },
  upload_failed: { label: "Failed", icon: X, className: "text-danger" },
  processing_failed: { label: "Failed", icon: AlertTriangle, className: "text-danger" },
  expired: { label: "Expired", icon: Clock, className: "text-muted" },
  deleted: { label: "Deleted", icon: X, className: "text-muted" },
};

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const spinning = status === "uploading" || status === "processing";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", meta.className, className)}>
      <Icon className={cn("size-3.5", spinning && "animate-spin")} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}

export function StatusDot({ status, className }: { status: JobStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn("inline-block size-2 rounded-full ring-1 ring-black/10", className)}
      style={{
        background:
          status === "completed"
            ? "var(--success)"
            : status === "processing" || status === "uploading"
              ? "var(--primary)"
              : status === "upload_failed" || status === "processing_failed"
                ? "var(--danger)"
                : "var(--muted)",
      }}
      role="img"
      aria-label={meta.label}
    />
  );
}

export { ScanText as OcrIcon };
