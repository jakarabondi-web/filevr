import type { Metadata } from "next";
import { RecentFilesPanel } from "@/components/files/recent-files-panel";
import { MOCK_RECENT_FILES } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Files — Filevr" };

export default function WorkspaceFilesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Files</h1>
      <p className="mt-1 text-muted">Every file you&apos;ve processed, with filters and bulk actions.</p>
      <div className="mt-6">
        <RecentFilesPanel files={MOCK_RECENT_FILES} />
      </div>
    </div>
  );
}
