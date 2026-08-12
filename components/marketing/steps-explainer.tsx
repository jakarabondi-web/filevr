import { Upload, MousePointerClick, Download } from "lucide-react";

const STEPS = [
  { title: "Upload", description: "Drop in a file or pick one from your device or cloud storage.", icon: Upload },
  { title: "Choose an action", description: "We suggest the right tool, or pick any from the workbench.", icon: MousePointerClick },
  { title: "Download or share", description: "Get your finished file instantly, or send a link.", icon: Download },
];

export function StepsExplainer() {
  return (
    <section aria-labelledby="steps-heading" className="bg-surface px-4 py-14 sm:px-8 md:px-10">
      <h2 id="steps-heading" className="text-2xl font-semibold text-text sm:text-[36px] sm:leading-[44px]">
        Three steps to done
      </h2>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
              <step.icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </span>
            <p className="text-sm font-semibold text-muted">Step {i + 1}</p>
            <h3 className="text-lg font-semibold text-text">{step.title}</h3>
            <p className="text-sm text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
