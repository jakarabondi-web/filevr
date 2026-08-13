/**
 * Filevr icon set. Every path is verbatim from public/icons/filevr/*.svg and is
 * inlined so stroke/fill follow currentColor and no per-icon request is made.
 * Regenerate from those files if the artwork changes.
 */
import type { SVGProps } from "react";

interface IconSpec {
  viewBox: string;
  fill: string;
  stroke?: string;
  strokeWidth?: string;
  body: React.ReactNode;
}

const ICONS = {
  "arrow-right": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6"/>
      </>
    ),
  },
  "bolt": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="m13 2-9 12h7l-1 8 10-13h-7z"/>
      </>
    ),
  },
  "chevron-down": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="m6 9 6 6 6-6"/>
      </>
    ),
  },
  "close": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="m5 5 14 14M19 5 5 19"/>
      </>
    ),
  },
  "compress": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/><path d="m3 8 5-5m8 0 5 5M3 16l5 5m8 0 5-5"/>
      </>
    ),
  },
  "convert": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M5 3h9l5 5v5M14 3v5h5"/><path d="M4 17h13m0 0-3-3m3 3-3 3"/>
      </>
    ),
  },
  "download": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/>
      </>
    ),
  },
  "edit": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 7 4 4M4 20l4-4"/>
      </>
    ),
  },
  "file-generic": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M6 2h8l4 4v16H6zM14 2v5h4M9 12h6M9 16h6"/>
      </>
    ),
  },
  "file-pdf": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M6 2h8l4 4v16H6zM14 2v5h4"/><path d="M8 17v-5h1.5a1.5 1.5 0 0 1 0 3H8m5 2v-5h1a2 2 0 0 1 0 4h-1m5-4h3m-3 2h2"/>
      </>
    ),
  },
  "file-word": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M6 2h8l4 4v16H6zM14 2v5h4"/><path d="m8 12 1.5 6 2-5 2 5 1.5-6"/>
      </>
    ),
  },
  "filevr-mark": {
    viewBox: "0 0 48 48",
    fill: "none",
    body: (
      <>
        <path fill="#C8FF3D" d="M8 7 23 2l16 6-15 6L8 7Z"/><path fill="#AEE800" d="M8 7v29l9 5V12L8 7Z"/><path fill="#D9FF66" d="m17 12 22-4v9l-14 3v7l11-2v9l-11 2v10l-8-5V12Z"/>
      </>
    ),
  },
  "home": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/>
      </>
    ),
  },
  "image-file": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M6 2h8l4 4v16H6zM14 2v5h4"/><circle cx="10" cy="11" r="1"/><path d="m8 18 3-4 2 2 2-3 2 3"/>
      </>
    ),
  },
  "lock": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>
      </>
    ),
  },
  "merge": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <rect x="3" y="3" width="13" height="13" rx="1"/><rect x="8" y="8" width="13" height="13" rx="1"/>
      </>
    ),
  },
  "more": {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    body: (
      <>
        <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
      </>
    ),
  },
  "ocr": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><circle cx="10" cy="12" r="3"/><path d="M16 9v6m0-6h2.5a2 2 0 0 1 0 4H16"/>
      </>
    ),
  },
  "plus": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M12 4v16M4 12h16"/>
      </>
    ),
  },
  "search": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>
      </>
    ),
  },
  "sign": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M3 20h18"/><path d="m5 16 1-4L16 2l4 4-10 10-5 1Z"/><path d="m14 4 4 4M11 16c1-2 2-2 3 0s2 2 4 0"/>
      </>
    ),
  },
  "templates": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>
      </>
    ),
  },
  "upload": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M12 16V3m0 0L7 8m5-5 5 5"/><path d="M5 14v6h14v-6"/>
      </>
    ),
  },
  "workspace": {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    body: (
      <>
        <path d="M3 7.5h7l2-2h9v14H3z"/><path d="M3 9.5h18"/>
      </>
    ),
  },
} satisfies Record<string, IconSpec>;

export type FilevrIconName = keyof typeof ICONS;

export function FilevrIcon({
  name,
  ...props
}: { name: FilevrIconName } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const icon: IconSpec = ICONS[name];
  return (
    <svg
      viewBox={icon.viewBox}
      fill={icon.fill}
      {...(icon.stroke
        ? {
            stroke: icon.stroke,
            strokeWidth: icon.strokeWidth,
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
          }
        : {})}
      {...props}
    >
      {icon.body}
    </svg>
  );
}
