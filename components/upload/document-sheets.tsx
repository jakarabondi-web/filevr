/**
 * Life-size paper sheets for the desktop hero poster. All dimensions use
 * container-query units (1cqw = 1/100 of the hero canvas width, canvas is
 * 1600 design units wide), so the sheets scale losslessly with the canvas.
 */
const u = (n: number) => `${n / 16}cqw`;

const SCOPE_ITEMS = [
  "Audit the existing document archive",
  "Migrate legacy files to new formats",
  "Configure retention & access policies",
  "Train administrators and staff",
  "Deliver rollout documentation",
];

export function ProposalSheet() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ padding: u(20) }}>
      <p className="font-bold tracking-[0.05em] text-ink" style={{ fontSize: u(15) }}>
        PROPOSAL
      </p>

      <p className="font-bold text-ink" style={{ fontSize: u(8.5), marginTop: u(12) }}>
        Project Overview
      </p>
      <p className="text-ink/45" style={{ fontSize: u(6.4), lineHeight: 1.55, marginTop: u(4) }}>
        Acme Corporation is pleased to submit this proposal for the redesign and migration of the
        shared document platform. The engagement covers discovery, implementation, and rollout
        across all regional teams, with deliverables scheduled in four phases.
      </p>
      <p className="text-ink/45" style={{ fontSize: u(6.4), lineHeight: 1.55, marginTop: u(5) }}>
        Work includes a full audit of the current archive, a conversion pipeline for legacy
        formats, retention policy configuration, and administrator training before handoff.
      </p>

      <p className="font-bold text-ink" style={{ fontSize: u(8.5), marginTop: u(13) }}>
        Scope
      </p>
      <div className="flex flex-col" style={{ gap: u(4), marginTop: u(5) }}>
        {SCOPE_ITEMS.map((item) => (
          <div key={item} className="flex items-center text-ink/50" style={{ gap: u(5), fontSize: u(6.4) }}>
            <svg viewBox="0 0 10 10" style={{ width: u(6), height: u(6) }} className="shrink-0 text-ink/70">
              <path d="M1.5 5.5 4 8 8.5 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="truncate">{item}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/15" style={{ marginTop: u(15) }} />
      <p className="font-bold text-ink" style={{ fontSize: u(8.5), marginTop: u(9) }}>
        Timeline
      </p>
      <div className="flex min-h-0 flex-1 items-stretch" style={{ gap: u(5), marginTop: u(6), maxHeight: u(96) }}>
        <div className="flex flex-col justify-between text-right text-ink/35" style={{ fontSize: u(5), paddingBottom: u(10) }}>
          {["40", "30", "20", "10"].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-end border-b border-l border-ink/25" style={{ gap: u(10), padding: `0 ${u(7)}` }}>
            {[38, 58, 48, 88].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-[2px] bg-lime" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex text-center text-ink/40" style={{ gap: u(10), padding: `${u(3)} ${u(7)} 0`, fontSize: u(5.5) }}>
            {["APR", "MAY", "JUN", "JUL"].map((m) => (
              <span key={m} className="flex-1">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContractSheet() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ padding: u(22) }}>
      <p className="font-bold tracking-[0.03em] text-ink" style={{ fontSize: u(15) }}>
        CONTRACT AGREEMENT
      </p>
      <p className="text-ink/50" style={{ fontSize: u(6.6), lineHeight: 1.55, marginTop: u(8) }}>
        This Agreement is made between the parties listed below.
      </p>

      <div style={{ marginTop: u(13) }}>
        <p className="font-bold tracking-[0.08em] text-ink" style={{ fontSize: u(7) }}>
          PARTY A
        </p>
        <p className="text-ink/55" style={{ fontSize: u(6.6), lineHeight: 1.5, marginTop: u(2) }}>
          Acme Corporation
          <br />
          123 Business Rd.
          <br />
          San Francisco, CA 94107
        </p>
      </div>

      <div style={{ marginTop: u(11) }}>
        <p className="font-bold tracking-[0.08em] text-ink" style={{ fontSize: u(7) }}>
          PARTY B
        </p>
        <p className="text-ink/55" style={{ fontSize: u(6.6), lineHeight: 1.5, marginTop: u(2) }}>
          Globex Solutions
          <br />
          456 Market St.
          <br />
          San Francisco, CA 94105
        </p>
      </div>

      <div className="flex-1" />

      <div className="flex items-end justify-between">
        <div>
          <p className="text-ink/55" style={{ fontSize: u(6.6) }}>
            Signature
          </p>
          <svg viewBox="0 0 120 40" className="text-ink" style={{ width: u(105), marginTop: u(2) }}>
            <path
              d="M6 30 C12 8 20 6 24 22 C28 38 32 12 40 14 C46 16 46 30 54 24 C62 18 60 10 68 16 C76 22 82 26 94 18 C102 12 108 20 116 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-right">
          <p className="text-ink/55" style={{ fontSize: u(6.6) }}>
            Date
          </p>
          <p className="text-ink/80" style={{ fontSize: u(7), marginTop: u(2) }}>
            May 8, 2024
          </p>
        </div>
      </div>
    </div>
  );
}

const INVOICE_ROWS: [string, string][] = [
  ["Consulting Services", "$2,500.00"],
  ["Design Work", "$1,200.00"],
  ["Revisions", "$300.00"],
];

function PaidStamp({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <defs>
        <path id="paid-arc-top" d="M13,50 A37,37 0 0 1 87,50" />
        <path id="paid-arc-bottom" d="M13,50 A37,37 0 0 0 87,50" />
      </defs>
      <text fill="currentColor" fontSize="9" fontWeight="700" letterSpacing="2.5">
        <textPath href="#paid-arc-top" startOffset="50%" textAnchor="middle">
          THANK YOU
        </textPath>
      </text>
      <text fill="currentColor" fontSize="9" fontWeight="700" letterSpacing="2.5">
        <textPath href="#paid-arc-bottom" startOffset="50%" textAnchor="middle">
          THANK YOU
        </textPath>
      </text>
      <text x="50" y="57" textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="800" letterSpacing="1">
        PAID
      </text>
      <circle cx="9" cy="50" r="1.6" fill="currentColor" />
      <circle cx="91" cy="50" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function InvoiceSheet() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ padding: u(20) }}>
      <div className="flex items-start justify-between">
        <p className="font-bold tracking-[0.05em] text-ink" style={{ fontSize: u(15) }}>
          INVOICE
        </p>
        <div className="text-right text-ink/50" style={{ fontSize: u(6), lineHeight: 1.45 }}>
          <p>Invoice #</p>
          <p className="text-ink/80">INV-2024-0487</p>
          <p style={{ marginTop: u(4) }}>Date</p>
          <p className="text-ink/80">May 8, 2024</p>
          <p style={{ marginTop: u(4) }}>Due Date</p>
          <p className="text-ink/80">June 7, 2024</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] border-y border-ink/25" style={{ marginTop: u(10) }}>
        <p className="font-semibold text-ink" style={{ fontSize: u(6.8), padding: `${u(3)} ${u(2)}` }}>
          Description
        </p>
        <p
          className="border-l border-ink/25 text-right font-semibold text-ink"
          style={{ fontSize: u(6.8), padding: `${u(3)} ${u(2)}`, minWidth: u(56) }}
        >
          Amount
        </p>
      </div>
      {INVOICE_ROWS.map(([label, amount]) => (
        <div key={label} className="grid grid-cols-[1fr_auto] border-b border-ink/10">
          <p className="text-ink/55" style={{ fontSize: u(6.4), padding: `${u(4)} ${u(2)}` }}>
            {label}
          </p>
          <p className="text-right text-ink/75" style={{ fontSize: u(6.4), padding: `${u(4)} ${u(2)}`, minWidth: u(56) }}>
            {amount}
          </p>
        </div>
      ))}

      <div className="self-end" style={{ width: "64%", marginTop: u(9) }}>
        <div className="flex justify-between text-ink/55" style={{ fontSize: u(6.4) }}>
          <span>Subtotal</span>
          <span className="text-ink/75">$4,000.00</span>
        </div>
        <div className="flex justify-between text-ink/55" style={{ fontSize: u(6.4), marginTop: u(3) }}>
          <span>Tax (8.5%)</span>
          <span className="text-ink/75">$340.00</span>
        </div>
        <div
          className="flex justify-between border-t border-ink/30 font-semibold text-ink"
          style={{ fontSize: u(7), marginTop: u(4), paddingTop: u(3) }}
        >
          <span>Total</span>
          <span>$4,340.00</span>
        </div>
      </div>

      <PaidStamp
        className="absolute text-ink/75"
        style={{ left: u(56), bottom: u(50), width: u(126), transform: "rotate(-14deg)" }}
      />

      <div className="mt-auto border-t border-dashed border-ink/35" style={{ marginBottom: u(24) }} />
    </div>
  );
}
