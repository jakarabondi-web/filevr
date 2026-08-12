import { Lock } from "lucide-react";

const ITEMS = ["PRIVATE BY DEFAULT", "AUTO-DELETED", "ENCRYPTED"];

export function PrivacyStrip() {
  return (
    <div
      aria-hidden="true"
      className="hidden xl:flex w-10 shrink-0 flex-col items-center justify-center gap-6 border-l border-black/10 py-10"
    >
      <div
        className="flex items-center gap-6 text-[10px] font-semibold tracking-[0.2em] text-ink/70"
        style={{ writingMode: "vertical-rl" }}
      >
        {ITEMS.map((item, i) => (
          <span key={item} className="flex items-center gap-6">
            {item}
            {i < ITEMS.length - 1 && <span aria-hidden="true">·</span>}
          </span>
        ))}
      </div>
      <Lock className="size-4 text-ink/60" strokeWidth={1.75} />
    </div>
  );
}
