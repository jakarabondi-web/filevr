import { Lock } from "lucide-react";

const ITEMS = ["PRIVATE BY DEFAULT", "AUTO-DELETED", "ENCRYPTED"];

export function PrivacyStrip() {
  return (
    <div aria-hidden="true" className="hidden w-12 shrink-0 flex-col items-center py-8 xl:flex">
      <div className="flex flex-1 items-center">
        <div
          className="flex items-center gap-6 text-[11.5px] font-bold tracking-[0.3em] text-ink"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {ITEMS.map((item, i) => (
            <span key={item} className="flex items-center gap-6">
              {item}
              {i < ITEMS.length - 1 && <span className="text-[8px]">●</span>}
            </span>
          ))}
        </div>
      </div>
      <Lock className="mt-6 size-5 text-ink" strokeWidth={2.25} />
    </div>
  );
}
