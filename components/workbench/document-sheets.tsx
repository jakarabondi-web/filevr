import { d } from "@/components/workbench/geometry";

/**
 * Miniature document previews built from CSS rules and short labels. Purely
 * decorative: the whole stack is aria-hidden, so nothing here is announced.
 */

function Rule({ w, tone = "line" }: { w: number; tone?: "line" | "faint" }) {
  return (
    <div
      className={tone === "line" ? "bg-ink/20" : "bg-ink/12"}
      style={{ height: d(3), width: `${w}%`, borderRadius: d(2) }}
    />
  );
}

function Heading({ children, size }: { children: React.ReactNode; size: number }) {
  return (
    <p
      className="font-semibold uppercase whitespace-nowrap text-ink"
      style={{ fontSize: d(size), letterSpacing: "0.01em" }}
    >
      {children}
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-semibold text-ink/70" style={{ fontSize: d(10) }}>
      {children}
    </p>
  );
}

export function ProposalPreview() {
  return (
    <div className="flex h-full w-full flex-col" style={{ padding: d(24), gap: d(14) }}>
      <Heading size={19}>Proposal</Heading>

      <div className="flex flex-col" style={{ gap: d(7) }}>
        <Label>Project Overview</Label>
        <div className="flex flex-col" style={{ gap: d(5) }}>
          {[96, 90, 93, 60].map((w, i) => (
            <Rule key={i} w={w} tone="faint" />
          ))}
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: d(7) }}>
        <Label>Scope</Label>
        <div className="flex flex-col" style={{ gap: d(6) }}>
          {[82, 88, 76, 70].map((w, i) => (
            <div key={i} className="flex items-center" style={{ gap: d(7) }}>
              <span className="shrink-0 rounded-full bg-ink/60" style={{ width: d(5), height: d(5) }} />
              <Rule w={w} tone="faint" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col" style={{ gap: d(8) }}>
        <Label>Timeline</Label>
        <div className="flex items-end" style={{ gap: d(10), height: d(78) }}>
          {[42, 62, 52, 92].map((h, i) => (
            <div key={i} className="flex-1 bg-acid" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="border-t border-ink/25" />
      </div>
    </div>
  );
}

export function ContractPreview() {
  return (
    <div className="flex h-full w-full flex-col" style={{ padding: d(24), gap: d(16) }}>
      <Heading size={17}>Contract Agreement</Heading>

      <div className="flex flex-col" style={{ gap: d(5) }}>
        {[94, 62].map((w, i) => (
          <Rule key={i} w={w} tone="faint" />
        ))}
      </div>

      {["Party A", "Party B"].map((party) => (
        <div key={party} className="flex flex-col" style={{ gap: d(6) }}>
          <Label>{party}</Label>
          <div className="flex flex-col" style={{ gap: d(5) }}>
            {[70, 58, 76].map((w, i) => (
              <Rule key={i} w={w} tone="faint" />
            ))}
          </div>
        </div>
      ))}

      <div className="mt-auto flex items-end justify-between" style={{ gap: d(16) }}>
        <div className="flex flex-col" style={{ gap: d(6) }}>
          <Label>Signature</Label>
          <svg viewBox="0 0 130 34" className="text-ink" style={{ width: d(120) }}>
            <path
              d="M5 26C11 7 19 5 23 20C27 35 31 10 39 12C45 14 45 27 53 21C61 15 59 8 67 14C75 20 81 24 93 16C101 11 108 19 125 11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <div className="border-t border-ink/30" style={{ width: d(150) }} />
        </div>
        <div className="flex flex-col items-end" style={{ gap: d(6) }}>
          <Label>Date</Label>
          <Rule w={100} />
        </div>
      </div>
    </div>
  );
}

/** Circular "THANK YOU / PAID" rubber stamp. */
function PaidStamp() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute text-ink/70"
      style={{ width: d(118), left: d(46), bottom: d(56), transform: "rotate(-14deg)" }}
    >
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <defs>
        <path id="stamp-arc-top" d="M14,50 A36,36 0 0 1 86,50" />
        <path id="stamp-arc-bottom" d="M14,50 A36,36 0 0 0 86,50" />
      </defs>
      <text fill="currentColor" fontSize="9" fontWeight="700" letterSpacing="2.4">
        <textPath href="#stamp-arc-top" startOffset="50%" textAnchor="middle">
          THANK YOU
        </textPath>
      </text>
      <text fill="currentColor" fontSize="9" fontWeight="700" letterSpacing="2.4">
        <textPath href="#stamp-arc-bottom" startOffset="50%" textAnchor="middle">
          THANK YOU
        </textPath>
      </text>
      <text x="50" y="57" textAnchor="middle" fill="currentColor" fontSize="19" fontWeight="800">
        PAID
      </text>
    </svg>
  );
}

export function InvoicePreview() {
  return (
    <div className="relative flex h-full w-full flex-col" style={{ padding: d(24), gap: d(14) }}>
      <div className="flex items-start justify-between" style={{ gap: d(12) }}>
        <Heading size={19}>Invoice</Heading>
        <div className="flex flex-col items-end" style={{ gap: d(4), width: "42%" }}>
          {[100, 72, 88].map((w, i) => (
            <Rule key={i} w={w} tone="faint" />
          ))}
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: d(8) }}>
        <div className="flex items-center justify-between border-y border-ink/30" style={{ padding: `${d(6)} 0` }}>
          <Label>Description</Label>
          <Label>Amount</Label>
        </div>
        {[74, 60, 52].map((w, i) => (
          <div key={i} className="flex items-center justify-between border-b border-ink/10" style={{ gap: d(12), paddingBottom: d(8) }}>
            <div className="flex-1">
              <Rule w={w} tone="faint" />
            </div>
            <div style={{ width: "26%" }}>
              <Rule w={100} tone="faint" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col self-end" style={{ gap: d(6), width: "58%" }}>
        {[100, 84].map((w, i) => (
          <div key={i} className="flex items-center justify-between" style={{ gap: d(10) }}>
            <Rule w={w * 0.5} tone="faint" />
            <div style={{ width: "42%" }}>
              <Rule w={100} tone="faint" />
            </div>
          </div>
        ))}
        <div className="border-t border-ink/40" style={{ paddingTop: d(6) }}>
          <div className="flex items-center justify-between" style={{ gap: d(10) }}>
            <Rule w={38} />
            <div style={{ width: "42%" }}>
              <Rule w={100} />
            </div>
          </div>
        </div>
      </div>

      <PaidStamp />
      <div className="mt-auto border-t border-dashed border-ink/35" />
    </div>
  );
}
