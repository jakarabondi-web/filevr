import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "pdf" | "word" | "generic";

function kindFromName(name: string): Kind {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "word";
  return "generic";
}

const KIND_STYLES: Record<Kind, { bg: string; fg: string; label: string }> = {
  pdf: { bg: "bg-coral/15", fg: "text-coral", label: "PDF" },
  word: { bg: "bg-primary/15", fg: "text-primary", label: "W" },
  generic: { bg: "bg-border", fg: "text-muted", label: "" },
};

export function FileTypeIcon({ name, className }: { name: string; className?: string }) {
  const kind = kindFromName(name);
  const { bg, fg, label } = KIND_STYLES[kind];

  return (
    <span
      className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", bg, fg, className)}
      aria-hidden="true"
    >
      {label ? (
        <span className="text-[10px] font-black tracking-tight">{label}</span>
      ) : (
        <FileText className="size-4" strokeWidth={2} />
      )}
    </span>
  );
}
