import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ConvertIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3.5h6l4 4V19a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 19V4.7A1.2 1.2 0 0 1 7 3.5Z" />
      <path d="M13 3.5V8h4" />
      <path d="M8.6 15.3a2.9 2.9 0 0 1 4.9-2.1" />
      <path d="M13.9 11.6l.2 1.9-1.9-.1" />
      <path d="M15.4 14.7a2.9 2.9 0 0 1-4.9 2.1" />
      <path d="M10.1 18.4l-.2-1.9 1.9.1" />
    </svg>
  );
}

function CompressIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="1.4" />
      <path d="M9 9.5 12 7l3 2.5" />
      <path d="M9 14.5 12 17l3-2.5" />
      <path d="M12 7v3.6" />
      <path d="M12 17v-3.6" />
    </svg>
  );
}

function SignIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 17.5c2.4.6 3.6-2.6 5.7-3.1 1.6-.4 2 1.6 3.5 1.1 1.8-.6 2.2-3.3 4.3-3.5" />
      <path d="M14.3 4.3a1.6 1.6 0 0 1 2.3 2.3L9.8 13.4l-2.9.7.7-2.9 6.7-6.9Z" />
      <path d="M4 20.5h16" />
    </svg>
  );
}

function MergeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="10" height="12.5" rx="1.2" />
      <rect x="9.7" y="8.2" width="10" height="12.5" rx="1.2" fill="var(--surface,#fff)" />
    </svg>
  );
}

function OcrIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8V5.4A1.4 1.4 0 0 1 5.4 4H8" />
      <path d="M16 4h2.6A1.4 1.4 0 0 1 20 5.4V8" />
      <path d="M20 16v2.6a1.4 1.4 0 0 1-1.4 1.4H16" />
      <path d="M8 20H5.4A1.4 1.4 0 0 1 4 18.6V16" />
      <path d="M7.5 9.5h9" />
      <path d="M7.5 12.5h6.5" />
      <path d="M7.5 15.5h4.5" />
    </svg>
  );
}

function EditIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3.5h7l4 4V19a1.2 1.2 0 0 1-1.2 1.2H6.5A1.2 1.2 0 0 1 5.3 19V4.7A1.2 1.2 0 0 1 6.5 3.5Z" />
      <path d="M13.5 3.5V8h4" />
      <path d="M8 13.2h4.2" />
      <path d="M15.6 12.9a1.15 1.15 0 0 1 1.63 1.63l-3.4 3.4-2.1.5.5-2.1 3.37-3.43Z" />
    </svg>
  );
}

const ICONS = {
  FileOutput: ConvertIcon,
  ArrowRightToLine: CompressIcon,
  PenLine: SignIcon,
  Copy: MergeIcon,
  ScanText: OcrIcon,
  PenSquare: EditIcon,
} as const;

export type ToolIconName = keyof typeof ICONS;

export function ToolIcon({ name, ...props }: { name: string } & IconProps) {
  const Icon = ICONS[name as ToolIconName] ?? ConvertIcon;
  return <Icon {...props} />;
}
