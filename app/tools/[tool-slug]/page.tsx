import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { ToolLauncher } from "@/components/tools/tool-launcher";
import { ToolIcon } from "@/components/ui/tool-icon";
import { TOOLS, getToolBySlug } from "@/config/tools";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ "tool-slug": tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "tool-slug": string }>;
}): Promise<Metadata> {
  const { "tool-slug": slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Filevr`,
    description: tool.description,
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ "tool-slug": string }>;
}) {
  const { "tool-slug": slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <ToolIcon name={tool.icon} className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{tool.category}</p>
            <h1 className="text-2xl font-semibold text-text">{tool.name}</h1>
          </div>
        </div>
        <p className="mt-3 text-muted">{tool.description}</p>

        <div className="mt-8">
          <ToolLauncher tool={tool} />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
