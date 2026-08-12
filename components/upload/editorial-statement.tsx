export function EditorialStatement() {
  return (
    <div className="px-4 pt-8 sm:px-8 sm:pt-10 md:px-10 md:pt-12">
      <h1 className="font-display rise-in max-w-3xl text-[46px] uppercase leading-[0.94] tracking-[-0.01em] text-ink sm:text-[64px] lg:text-[88px] lg:leading-[0.92]">
        Files in.
        <br />
        Finished
        <br />
        work out.
      </h1>
      <div
        className="rise-in mt-5 flex items-start gap-3 sm:mt-7"
        style={{ animationDelay: "0.08s" }}
      >
        <p className="max-w-xs text-base text-ink-soft sm:text-lg">One workspace for every document job.</p>
        <svg
          aria-hidden="true"
          width="72"
          height="40"
          viewBox="0 0 72 40"
          className="mt-1 hidden shrink-0 text-ink lg:block"
        >
          <path
            d="M2 4C24 6 40 14 46 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M46 30L38 24M46 30L50 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
