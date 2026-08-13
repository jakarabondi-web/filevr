import { File, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "pdf" | "word" | "generic";

function kindFromName(name: string): Kind {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "word";
  return "generic";
}

/** Outlined page glyph color-coded by file type, matching the reference bar. */
export function FileTypeIcon({ name, className }: { name: string; className?: string }) {
  const kind = kindFromName(name);

  if (kind === "generic") {
    return <FileText aria-hidden="true" className={cn("size-7 shrink-0 text-ink/60", className)} strokeWidth={1.6} />;
  }

  const color = kind === "pdf" ? "text-coral" : "text-primary";
  return (
    <span className={cn("relative inline-flex size-7 shrink-0 items-center justify-center", color, className)} aria-hidden="true">
      <File className="absolute inset-0 size-full" strokeWidth={1.6} />
      <span
        className={cn(
          "relative font-black leading-none",
          kind === "pdf" ? "mt-[9px] text-[6px] tracking-tight" : "mt-[8px] text-[10px]"
        )}
      >
        {kind === "pdf" ? "PDF" : "W"}
      </span>
    </span>
  );
}
