"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CANVAS_H, CANVAS_W } from "@/components/workbench/geometry";
import { Sidebar } from "@/components/workbench/sidebar";
import { TopBar } from "@/components/workbench/top-bar";
import { PrivacyRail, TrustLine } from "@/components/workbench/privacy-rail";
import { UtilityBar } from "@/components/workbench/utility-bar";
import { EditorialStatement } from "@/components/workbench/editorial-statement";
import { DocumentWorkbench } from "@/components/workbench/document-workbench";
import { ContinueRibbon } from "@/components/workbench/continue-ribbon";
import { CommandPalette } from "@/components/workbench/command-palette";
import { PICKER_ACCEPT, RECENT_DOCUMENTS, SUPPORTED_FORMATS_LABEL, type RecentDocument, type WorkflowAction } from "@/components/workbench/data";
import { useUploadQueue } from "@/components/upload/use-upload-queue";
import type { SessionUser } from "@/lib/auth";

export function FilevrWorkbenchPage({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const { files, addFiles, reset } = useUploadQueue();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [documents, setDocuments] = useState<RecentDocument[]>(RECENT_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = useCallback(() => {
    setError(null);
    inputRef.current?.click();
  }, []);

  const acceptFiles = useCallback(
    (list: FileList) => {
      const result = addFiles(Array.from(list));
      if (!result.valid) {
        setError(result.errorMessage ?? `That file type isn't supported. Try ${SUPPORTED_FORMATS_LABEL}.`);
      } else {
        setError(null);
      }
    },
    [addFiles]
  );

  const runAction = useCallback(
    (action: WorkflowAction) => {
      setSelectedAction(action.slug);
      setPaletteOpen(false);
      if (files.length === 0) {
        openPicker();
        return;
      }
      setLoadingAction(action.slug);
      router.push(`/task/${action.slug}`);
    },
    [files.length, openPicker, router]
  );

  const handleNewWorkflow = useCallback(() => {
    if (files.length > 0 && !window.confirm(`Clear ${files.length} selected file${files.length > 1 ? "s" : ""} and start a new workflow?`)) {
      return;
    }
    reset();
    setSelectedAction(null);
    setError(null);
  }, [files.length, reset]);

  const handleCloseDoc = useCallback((doc: RecentDocument) => {
    if (!window.confirm(`Remove ${doc.name} from recent documents?`)) return;
    setDocuments((prev) => prev.filter((p) => p.id !== doc.id));
  }, []);

  const fileCount = files.length;
  const liveMessage =
    fileCount === 0
      ? ""
      : `${fileCount} file${fileCount > 1 ? "s" : ""} selected: ${files.map((f) => f.name).join(", ")}`;

  const shared = {
    fileCount,
    selectedAction,
    loadingAction,
    onOpenPicker: openPicker,
    onSelectAction: runAction,
    onFilesDropped: acceptFiles,
    error,
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={PICKER_ACCEPT}
        className="sr-only"
        aria-label={`Choose files. Supported types: ${SUPPORTED_FORMATS_LABEL}`}
        onChange={(e) => {
          if (e.target.files?.length) acceptFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p aria-live="polite" className="sr-only">
        {liveMessage}
      </p>

      <TopBar
        user={user}
        onNewWorkflow={handleNewWorkflow}
        onOpenSearch={() => setPaletteOpen(true)}
      />

      <div className="flex min-h-dvh w-full xl:h-dvh xl:min-h-[760px] xl:overflow-hidden">
        <Sidebar user={user} />

        <main id="main" className="paper-grain flex min-w-0 flex-1 flex-col">
          {/* Desktop: one scaled composition. --u is the design pixel. */}
          <div
            className="relative hidden min-h-0 flex-1 xl:block"
            style={{ containerType: "size" }}
          >
            <div
              className="absolute inset-0"
              style={{ ["--u" as string]: `min(100cqw / ${CANVAS_W}, 100cqh / ${CANVAS_H})` }}
            >
              <UtilityBar
                user={user}
                onNewWorkflow={handleNewWorkflow}
                onOpenSearch={() => setPaletteOpen(true)}
                scaled
              />
              <EditorialStatement scaled />
              <DocumentWorkbench {...shared} scaled />
              <ContinueRibbon
                documents={documents}
                selectedId={selectedDoc}
                onSelect={setSelectedDoc}
                onClose={handleCloseDoc}
                scaled
              />
            </div>
          </div>

          {/* Below 1280px: normal document flow. */}
          <div className="flex flex-col xl:hidden">
            {/* Under 768px the sticky TopBar carries these controls instead. */}
            <div className="max-md:hidden">
              <UtilityBar
                user={user}
                onNewWorkflow={handleNewWorkflow}
                onOpenSearch={() => setPaletteOpen(true)}
              />
            </div>
            <div className="md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:items-center md:gap-2">
              <EditorialStatement />
              <DocumentWorkbench {...shared} />
            </div>
            <ContinueRibbon
              documents={documents}
              selectedId={selectedDoc}
              onSelect={setSelectedDoc}
              onClose={handleCloseDoc}
            />
            <TrustLine />
          </div>
        </main>

        <PrivacyRail />
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} onRun={runAction} />}
    </>
  );
}
