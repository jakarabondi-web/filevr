export function DocumentStack() {
  return (
    <div className="relative mx-auto h-[300px] w-[220px] sm:h-[360px] sm:w-[260px] lg:h-[420px] lg:w-[300px]" aria-hidden="true">
      <div className="absolute inset-0 -rotate-6 rounded-xl border border-black/10 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <p className="text-[10px] font-bold tracking-wide text-ink sm:text-xs">PROPOSAL</p>
        <p className="mt-2 text-[7px] font-semibold uppercase text-muted sm:text-[8px]">Project overview</p>
        <div className="mt-1 space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1 rounded bg-border" style={{ width: `${90 - i * 12}%` }} />
          ))}
        </div>
        <p className="mt-3 text-[7px] font-semibold uppercase text-muted sm:text-[8px]">Timeline</p>
        <div className="mt-1 flex h-10 items-end gap-1 sm:h-14">
          {[40, 65, 50, 80, 55].map((h, i) => (
            <div key={i} className="w-2 rounded-t bg-lime" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 rotate-3 translate-x-2 rounded-xl border border-black/10 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <p className="text-[10px] font-bold tracking-wide text-ink sm:text-xs">CONTRACT AGREEMENT</p>
        <p className="mt-2 text-[7px] leading-relaxed text-muted sm:text-[8px]">
          This agreement is made between the parties listed below.
        </p>
        <div className="mt-3 space-y-1">
          {[0, 1].map((i) => (
            <div key={i} className="h-1 rounded bg-border" style={{ width: `${85 - i * 15}%` }} />
          ))}
        </div>
        <div className="mt-6 flex items-end justify-between">
          <svg width="52" height="20" viewBox="0 0 52 20" className="text-primary">
            <path
              d="M2 16C8 4 12 18 18 8C22 2 26 16 32 10C36 6 40 14 50 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-[6px] text-muted sm:text-[7px]">May 8, 2026</p>
        </div>
      </div>

      <div className="absolute inset-0 -rotate-1 -translate-x-2 translate-y-1 rounded-xl border border-black/10 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <p className="text-[10px] font-bold tracking-wide text-ink sm:text-xs">INVOICE</p>
        <p className="mt-1 text-[6px] text-muted sm:text-[7px]">INV-2026-0487</p>
        <div className="mt-3 space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between text-[6px] text-muted sm:text-[7px]">
              <span className="h-1 w-14 rounded bg-border" />
              <span className="h-1 w-6 rounded bg-border" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-2">
          <span className="text-[7px] font-semibold text-ink sm:text-[8px]">Total</span>
          <span className="text-[7px] font-semibold text-ink sm:text-[8px]">$4,340.00</span>
        </div>
      </div>
    </div>
  );
}
