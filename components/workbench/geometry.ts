/**
 * Desktop composition geometry, in design pixels against the 1672x941 reference.
 *
 * The main canvas (between the 180px sidebar and the 72px privacy rail) is
 * 1420x941 design px. Every desktop measurement below is expressed in that
 * space and rendered through `d()`, which multiplies by `--u` — a single
 * unit length the canvas derives from its own size:
 *
 *   --u: min(100cqw / 1420, 100cqh / 941)
 *
 * At a 1672x941 viewport `--u` resolves to exactly 1px, so the render matches
 * the reference one-to-one; on smaller viewports the whole composition scales
 * uniformly to fit without ever overflowing.
 */

export const CANVAS_W = 1420;
export const CANVAS_H = 941;

/** Design pixels -> a scaled CSS length. */
export const d = (n: number) => `calc(var(--u) * ${n})`;

/** Explicit layer scale — avoids ad-hoc z-index escalation. */
export const LAYER = {
  sheet: 10,
  connector: 20,
  drop: 30,
  action: 40,
  chrome: 50,
} as const;

export const STATEMENT = {
  left: 40,
  top: 92,
  width: 420,
  h1Size: 88,
  copyTop: 426,
  copySize: 26,
  copyWidth: 290,
  arrow: { left: 338, top: 416, width: 132, height: 78 },
} as const;

export const UTILITY = {
  top: 24,
  right: 34,
  height: 53,
  gap: 18,
  newWidth: 186,
  searchWidth: 344,
  usageWidth: 204,
  upgradeWidth: 136,
} as const;

export interface SheetGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
}

/** Sheet `left`/`top` are the un-rotated box origin; rotation is about center. */
export const SHEETS: Record<"proposal" | "contract" | "invoice", SheetGeometry> = {
  proposal: { left: 474, top: 174, width: 292, height: 520, rotate: -7 },
  contract: { left: 682, top: 137, width: 286, height: 580, rotate: -0.5 },
  invoice: { left: 925, top: 170, width: 260, height: 515, rotate: 7 },
};

export const DROP = { left: 667, top: 367, size: 236, iconSize: 57, iconTop: 40 } as const;

export const RIBBON = { left: 40, right: 24, bottom: 39, height: 76, arrowWidth: 69 } as const;
