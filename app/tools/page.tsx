import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { ToolDirectory } from "@/components/tools/tool-directory";
import { TOOL_CATEGORIES } from "@/config/tools";
import type { ToolCategory } from "@/types";

export const metadata: Metadata = {
  title: "All tools — Filevr",
  description: "Browse every document tool Filevr offers, organized by category.",
};

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const initialCategory = TOOL_CATEGORIES.includes(category as ToolCategory)
    ? (category as ToolCategory)
    : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8">
        <h1 className="text-3xl font-semibold text-text">All tools</h1>
        <p className="mt-2 text-muted">Find the right tool for your document, or drop a file on the homepage to get a recommendation.</p>
        <div className="mt-8">
          <ToolDirectory initialCategory={initialCategory} />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
