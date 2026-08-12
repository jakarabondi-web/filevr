import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskStep {
  key: string;
  label: string;
}

export function TaskStepper({ steps, currentKey }: { steps: TaskStep[]; currentKey: string }) {
  const currentIndex = steps.findIndex((s) => s.key === currentKey);

  return (
    <nav aria-label="Task progress">
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((step, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <li key={step.key} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    isComplete && "border-success bg-success text-white",
                    isCurrent && "border-primary bg-primary text-white",
                    !isComplete && !isCurrent && "border-border bg-surface text-muted"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn("hidden text-sm font-medium sm:inline", isCurrent ? "text-text" : "text-muted")}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && <span className="h-px w-4 bg-border sm:w-8" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
