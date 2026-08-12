import type { Metadata } from "next";
import Link from "next/link";
import { RecentFilesPanel } from "@/components/files/recent-files-panel";
import { MOCK_RECENT_FILES } from "@/lib/mock-data";
import { TOOLS } from "@/config/tools";
import { ToolCard } from "@/components/tools/tool-card";

export const metadata: Metadata = { title: "Workspace — Filevr" };

export default function WorkspacePage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Workspace</h1>
      <p className="mt-1 text-muted">Pick up recent work or start something new.</p>

      <section aria-labelledby="pinned-heading" className="mt-8">
        <h2 id="pinned-heading" className="text-sm font-semibold uppercase tracking-wide text-muted">
          Pinned workflows
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TOOLS.slice(0, 4).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="mt-8">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-sm font-semibold uppercase tracking-wide text-muted">
            Recent files
          </h2>
          <Link href="/workspace/files" className="text-sm font-medium text-primary hover:underline focus-ring rounded-sm">
            View all
          </Link>
        </div>
        <div className="mt-3">
          <RecentFilesPanel files={MOCK_RECENT_FILES} limit={3} />
        </div>
      </section>
    </div>
  );
}
