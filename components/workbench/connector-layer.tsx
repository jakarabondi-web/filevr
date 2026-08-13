import { CANVAS_H, CANVAS_W, LAYER } from "@/components/workbench/geometry";

/**
 * Curved connectors from each workflow pill to the paper it acts on. Drawn in
 * one SVG that shares the composition's design-pixel coordinate space, so the
 * curves scale with everything else.
 */

interface Connector {
  /** Cubic path from the pill edge toward the paper. */
  path: string;
  /** Terminating dot, omitted where the connector ends in an arrowhead. */
  dot?: [number, number];
}

const CONNECTORS: Connector[] = [
  { path: "M372 545 C424 556 462 552 494 536", dot: [500, 534] },
  { path: "M331 642 C398 642 452 628 508 614", dot: [514, 612] },
  { path: "M486 722 C548 742 606 736 640 708" },
  { path: "M1212 326 C1188 350 1172 372 1160 392", dot: [1156, 398] },
  { path: "M1208 569 C1188 562 1168 554 1152 546", dot: [1146, 543] },
  { path: "M1146 726 C1132 700 1124 668 1122 642", dot: [1120, 636] },
];

/** Arrowhead closing the Sign connector, matching the reference. */
const SIGN_ARROWHEAD = "M652 698 L628 702 L642 718 Z";

export function ConnectorLayer() {
  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: LAYER.connector }}
    >
      <g fill="none" stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round">
        {CONNECTORS.map((c) => (
          <path key={c.path} d={c.path} />
        ))}
      </g>
      <g fill="var(--ink)">
        {CONNECTORS.filter((c) => c.dot).map((c) => (
          <circle key={c.path} cx={c.dot![0]} cy={c.dot![1]} r="7" />
        ))}
        <path d={SIGN_ARROWHEAD} />
      </g>
    </svg>
  );
}

/** Hand-drawn arrow linking the editorial statement to the document stack. */
export function StatementArrow() {
  return (
    <svg
      viewBox="0 0 132 78"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12C40 16 76 30 104 58" />
      <path d="M110 64 L82 56" />
      <path d="M110 64 L102 36" />
    </svg>
  );
}
