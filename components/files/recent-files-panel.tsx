"use client";

import { useState } from "react";
import { Download, MoreHorizontal, Pencil, Trash2, FileText } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatBytes, cn } from "@/lib/utils";
import type { JobStatus } from "@/types";

export interface RecentFile {
  id: string;
  name: string;
  status: JobStatus;
  sizeBytes: number;
  updatedAt: string;
}

export function RecentFilesPanel({ files, limit }: { files: RecentFile[]; limit?: number }) {
  const [items, setItems] = useState(files);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const visible = limit ? items.slice(0, limit) : items;

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
      {visible.length === 0 && (
        <li className="px-4 py-10 text-center text-sm text-muted">Your completed files will appear here.</li>
      )}
      {visible.map((file) => (
        <li key={file.id} className="flex items-center gap-3 px-4 py-3">
          <FileText aria-hidden="true" className="size-5 shrink-0 text-muted" />
          <div className="min-w-0 flex-1">
            {renamingId === file.id ? (
              <input
                autoFocus
                defaultValue={file.name}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  setItems((prev) => prev.map((f) => (f.id === file.id ? { ...f, name: value || f.name } : f)));
                  setRenamingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setRenamingId(null);
                }}
                className="w-full rounded-md border border-primary bg-surface px-2 py-1 text-sm focus-ring"
                aria-label={`Rename ${file.name}`}
              />
            ) : (
              <p className={cn("truncate text-sm font-medium text-text")}>{file.name}</p>
            )}
            <p className="text-xs text-muted">{formatBytes(file.sizeBytes)}</p>
          </div>
          <StatusBadge status={file.status} className="hidden sm:flex" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md p-1.5 text-muted hover:text-text focus-ring"
              aria-label={`Download ${file.name}`}
            >
              <Download aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setRenamingId(file.id)}
              className="rounded-md p-1.5 text-muted hover:text-text focus-ring"
              aria-label={`Rename ${file.name}`}
            >
              <Pencil aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((f) => f.id !== file.id))}
              className="rounded-md p-1.5 text-muted hover:text-danger focus-ring"
              aria-label={`Delete ${file.name}`}
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
            <button type="button" className="rounded-md p-1.5 text-muted hover:text-text focus-ring" aria-label={`More options for ${file.name}`}>
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
