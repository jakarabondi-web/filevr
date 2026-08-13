import type { FilevrIconName } from "@/components/ui/filevr-icon";
import type { JobStatus } from "@/types";

export type ActionAccent = "acid" | "cobalt" | "coral";

export interface NavItem {
  label: string;
  href: string;
  icon: FilevrIconName;
  /** Rendered only when a session exists. */
  authOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Workspace", href: "/workspace", icon: "workspace", authOnly: true },
  { label: "Templates", href: "/tools", icon: "templates" },
];

export interface WorkflowAction {
  slug: string;
  label: string;
  description: string;
  icon: FilevrIconName;
  accent: ActionAccent;
  /** Desktop placement in design px: box origin and pill width. */
  x: number;
  y: number;
  width: number;
}

export const WORKFLOW_ACTIONS: WorkflowAction[] = [
  {
    slug: "pdf-to-word",
    label: "Convert",
    description: "Convert PDFs to editable Word documents.",
    icon: "convert",
    accent: "acid",
    x: 184,
    y: 510,
    width: 188,
  },
  {
    slug: "compress-pdf",
    label: "Compress",
    description: "Reduce file size while maintaining quality.",
    icon: "compress",
    accent: "cobalt",
    x: 124,
    y: 607,
    width: 207,
  },
  {
    slug: "sign-pdf",
    label: "Sign",
    description: "Add a signature or request signatures securely.",
    icon: "sign",
    accent: "coral",
    x: 316,
    y: 687,
    width: 170,
  },
  {
    slug: "edit-pdf",
    label: "Edit",
    description: "Edit text, images, and pages directly.",
    icon: "edit",
    accent: "cobalt",
    x: 1212,
    y: 291,
    width: 165,
  },
  {
    slug: "ocr-pdf",
    label: "OCR",
    description: "Make scanned files searchable and editable.",
    icon: "ocr",
    accent: "acid",
    x: 1208,
    y: 534,
    width: 169,
  },
  {
    slug: "merge-pdf",
    label: "Merge",
    description: "Combine multiple PDFs into one document.",
    icon: "merge",
    accent: "coral",
    x: 1146,
    y: 691,
    width: 187,
  },
];

export const ACTION_HEIGHT = 70;

/** Tailwind classes per accent, for the pill surface. */
export const ACCENT_SURFACE: Record<ActionAccent, string> = {
  acid: "bg-acid text-ink hover:bg-acid-hover",
  cobalt: "bg-cobalt text-white hover:bg-cobalt-hover",
  coral: "bg-coral text-ink hover:bg-coral-hover",
};

export interface RecentDocument {
  id: string;
  name: string;
  icon: FilevrIconName;
  status: JobStatus;
  /** Dot color token driving the tab's status indicator. */
  accent: ActionAccent;
}

export const RECENT_DOCUMENTS: RecentDocument[] = [
  { id: "job_1", name: "Proposal.pdf", icon: "file-pdf", status: "completed", accent: "acid" },
  { id: "job_2", name: "Contract.docx", icon: "file-word", status: "processing", accent: "cobalt" },
  { id: "job_3", name: "Invoice scan", icon: "file-generic", status: "processing_failed", accent: "coral" },
];

export const PRIVACY_TERMS = ["PRIVATE BY DEFAULT", "AUTO-DELETED", "ENCRYPTED"] as const;

export const PICKER_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.heic,.txt";

export const SUPPORTED_FORMATS_LABEL =
  "PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, HEIC, TXT";
