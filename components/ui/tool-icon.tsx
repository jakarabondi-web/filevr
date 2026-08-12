import {
  FileOutput,
  Minimize2,
  PenLine,
  Copy,
  ScanText,
  PenSquare,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  FileOutput,
  ArrowRightToLine: Minimize2,
  PenLine,
  Copy,
  ScanText,
  PenSquare,
} as const;

export type ToolIconName = keyof typeof ICONS;

export function ToolIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as ToolIconName] ?? FileOutput;
  return <Icon {...props} />;
}
