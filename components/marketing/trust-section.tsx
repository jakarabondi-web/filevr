import { ShieldCheck, Lock, Trash2, Globe2 } from "lucide-react";

const TRUST_ITEMS = [
  { title: "TLS in transit", description: "Every upload and download is encrypted over TLS.", icon: Lock },
  { title: "Encrypted storage", description: "Files are encrypted at rest in isolated storage.", icon: ShieldCheck },
  { title: "Automatic deletion", description: "Files are deleted on a schedule based on your plan.", icon: Trash2 },
  { title: "GDPR & CCPA aligned", description: "Built with data-subject rights and deletion requests in mind.", icon: Globe2 },
];

export function TrustSection() {
  return (
    <section aria-labelledby="trust-heading" className="px-4 py-14 sm:px-8 md:px-10">
      <h2 id="trust-heading" className="text-2xl font-semibold text-text sm:text-[36px] sm:leading-[44px]">
        Built to protect your files
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-surface p-5">
            <item.icon aria-hidden="true" className="size-5 text-primary" strokeWidth={1.75} />
            <h3 className="mt-3 text-sm font-semibold text-text">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
