const FAQS = [
  {
    q: "Is my file kept private?",
    a: "Yes. Files are encrypted in transit and at rest, and automatically deleted according to your plan's retention policy.",
  },
  {
    q: "Do I need an account to use Filevr?",
    a: "No. You can upload a file and complete a task as a guest. Creating an account lets you save history and reuse signatures.",
  },
  {
    q: "What file types are supported?",
    a: "PDF, Word, Excel, PowerPoint, JPG, PNG, HEIC, and TXT are supported at launch.",
  },
  {
    q: "How long are processed files kept?",
    a: "Guest outputs expire after 2 hours, free-account outputs after 24 hours, and Pro follows your configured retention.",
  },
];

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="px-4 py-14 sm:px-8 md:px-10">
      <h2 id="faq-heading" className="text-2xl font-semibold text-text sm:text-[36px] sm:leading-[44px]">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {FAQS.map((item) => (
          <details key={item.q} className="group px-5 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-text focus-ring marker:content-none">
              {item.q}
            </summary>
            <p className="mt-2 text-sm text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
