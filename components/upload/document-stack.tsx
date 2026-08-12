export function DocumentStack() {
  return (
    <div
      className="relative mx-auto h-[280px] w-[260px] sm:h-[340px] sm:w-[320px] lg:h-[400px] lg:w-[380px]"
      aria-hidden="true"
    >
      <div
        className="absolute left-0 top-2 w-[220px] -rotate-[9deg] rounded-xl border border-black/10 bg-white p-4 shadow-[0_2px_4px_rgba(18,16,20,0.06),0_18px_28px_-12px_rgba(18,16,20,0.28)] sm:w-[250px] sm:p-5 lg:top-4 lg:w-[280px]"
        style={{ boxShadow: "0 2px 4px rgba(18,16,20,0.08), 0 20px 32px -14px rgba(18,16,20,0.32)" }}
      >
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

      <div
        className="absolute right-0 top-0 w-[220px] rotate-[7deg] rounded-xl border border-black/10 bg-white p-4 shadow-[var(--shadow-card)] sm:w-[250px] sm:p-5 lg:w-[280px]"
        style={{ boxShadow: "0 2px 4px rgba(18,16,20,0.08), 0 20px 32px -14px rgba(18,16,20,0.32)" }}
      >
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
        <div className="mt-2 flex justify-end">
          <span className="rounded-full border border-coral px-2 py-0.5 text-[6px] font-bold uppercase tracking-wide text-coral sm:text-[7px]">
            Paid
          </span>
        </div>
      </div>

      <div
        className="absolute left-1/2 top-6 w-[230px] -translate-x-1/2 rotate-[1.5deg] rounded-xl border border-black/10 bg-white p-4 sm:w-[260px] sm:p-5 lg:top-8 lg:w-[290px]"
        style={{ boxShadow: "0 3px 6px rgba(18,16,20,0.1), 0 26px 40px -14px rgba(18,16,20,0.38)" }}
      >
        <p className="text-[10px] font-bold tracking-wide text-ink sm:text-xs">CONTRACT AGREEMENT</p>
        <p className="mt-2 text-[7px] leading-relaxed text-muted sm:text-[8px]">
          This agreement is made between the parties listed below.
        </p>
        <div className="mt-3 space-y-1">
          {[0, 1].map((i) => (
            <div key={i} className="h-1 rounded bg-border" style={{ width: `${85 - i * 15}%` }} />
          ))}
        </div>
        <div className="mt-7 flex items-end justify-between sm:mt-9">
          <svg width="56" height="22" viewBox="0 0 56 22" className="text-primary">
            <path
              d="M2 17C9 4 13 19 20 8C24 2 28 17 34 10C38 5 42 15 54 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-[6px] text-muted sm:text-[7px]">May 8, 2026</p>
        </div>
      </div>
    </div>
  );
}
