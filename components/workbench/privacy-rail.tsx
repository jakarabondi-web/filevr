import { FilevrIcon } from "@/components/ui/filevr-icon";
import { PRIVACY_TERMS } from "@/components/workbench/data";

const LINE = PRIVACY_TERMS.join("  •  ");

/** Vertical right rail. Hidden below 1280px, where TrustLine carries the copy. */
export function PrivacyRail() {
  return (
    <aside
      aria-label="Privacy"
      className="hidden shrink-0 flex-col items-center border-l border-ink/35 bg-paper xl:flex xl:w-16 2xl:w-[72px]"
    >
      <div className="flex flex-1 items-center justify-center">
        <p
          className="text-[17px] font-bold uppercase tracking-[0.18em] text-ink whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {LINE}
        </p>
      </div>
      <FilevrIcon name="lock" className="mb-7 size-[25px] text-ink" aria-hidden="true" />
    </aside>
  );
}

/** Horizontal fallback shown from 768px to 1279px, where the rail is hidden. */
export function TrustLine() {
  return (
    <p className="flex items-center justify-center gap-2 border-t border-ink/20 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-ink xl:hidden">
      <FilevrIcon name="lock" className="size-4" aria-hidden="true" />
      {LINE}
    </p>
  );
}
