import { Loader2 } from "lucide-react";

export function ProcessingProgress({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center" aria-live="polite">
      <Loader2 aria-hidden="true" className="size-10 animate-spin text-primary" />
      <p className="text-lg font-semibold text-text">{label}</p>
      <div
        className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-sm text-muted">{progress}%</p>
    </div>
  );
}
