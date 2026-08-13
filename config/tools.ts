import type { ToolDefinition } from "@/types";

export const TOOLS: ToolDefinition[] = [
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    shortName: "Convert",
    description: "Convert PDFs to editable Word documents.",
    category: "Convert",
    acceptedMimeTypes: ["application/pdf"],
    acceptedExtensions: [".pdf"],
    icon: "FileOutput",
    accent: "lime",
    multiFile: false,
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    shortName: "Compress",
    description: "Reduce file size while maintaining quality.",
    category: "Organize",
    acceptedMimeTypes: ["application/pdf"],
    acceptedExtensions: [".pdf"],
    icon: "ArrowRightToLine",
    accent: "indigo",
    multiFile: true,
  },
  {
    slug: "sign-pdf",
    name: "Sign PDF",
    shortName: "Sign",
    description: "Add a signature or request signatures securely.",
    category: "Sign & Fill",
    acceptedMimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    acceptedExtensions: [".pdf", ".docx"],
    icon: "PenLine",
    accent: "coral",
    multiFile: false,
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    shortName: "Merge",
    description: "Combine multiple PDFs into one document.",
    category: "Organize",
    acceptedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    acceptedExtensions: [".pdf", ".jpg", ".jpeg", ".png"],
    icon: "Copy",
    accent: "coral",
    multiFile: true,
  },
  {
    slug: "ocr-pdf",
    name: "OCR PDF",
    shortName: "OCR",
    description: "Make scanned files searchable and editable.",
    category: "AI & OCR",
    acceptedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/heic"],
    acceptedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".heic"],
    icon: "ScanText",
    accent: "lime",
    multiFile: true,
  },
  {
    slug: "edit-pdf",
    name: "Edit PDF",
    shortName: "Edit",
    description: "Edit text, images, and pages directly.",
    category: "Edit",
    acceptedMimeTypes: ["application/pdf"],
    acceptedExtensions: [".pdf"],
    icon: "PenSquare",
    accent: "indigo",
    multiFile: false,
  },
];

/**
 * Tools backed by a real conversion engine. Anything else currently returns the
 * uploaded file unchanged, and the UI says so rather than implying a conversion
 * happened. Keep in step with the engine registry in lib/engines — that module
 * asserts the two agree.
 *
 * This lives here, not in lib/engines, because the client bundle needs it and
 * the engines import node:child_process.
 */
export const TOOLS_WITH_ENGINES: ReadonlySet<string> = new Set(["compress-pdf", "merge-pdf"]);

export function toolHasEngine(slug: string): boolean {
  return TOOLS_WITH_ENGINES.has(slug);
}

export const TOOL_CATEGORIES: ToolDefinition["category"][] = [
  "Convert",
  "Edit",
  "Organize",
  "Sign & Fill",
  "Secure",
  "AI & OCR",
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function recommendTools(files: { name: string; mimeType: string }[]): ToolDefinition[] {
  if (files.length === 0) return [];

  const pdfCount = files.filter((f) => f.mimeType === "application/pdf").length;
  const imageCount = files.filter((f) => f.mimeType.startsWith("image/")).length;

  if (pdfCount > 1) {
    return TOOLS.filter((t) => ["merge-pdf", "compress-pdf", "ocr-pdf"].includes(t.slug));
  }
  if (imageCount > 0 && pdfCount === 0) {
    return TOOLS.filter((t) => ["ocr-pdf", "merge-pdf"].includes(t.slug));
  }
  if (pdfCount === 1) {
    return TOOLS.filter((t) => ["compress-pdf", "edit-pdf", "sign-pdf"].includes(t.slug));
  }
  return TOOLS.slice(0, 3);
}

export const FREE_LIMITS = {
  filesPerTask: 20,
  maxFileSizeBytes: 100 * 1024 * 1024,
  maxTotalSizeBytes: 500 * 1024 * 1024,
};

export const PRO_LIMITS = {
  filesPerTask: 100,
  maxTotalSizeBytes: 2 * 1024 * 1024 * 1024,
};

export const SUPPORTED_MIME_TYPES = Array.from(
  new Set(TOOLS.flatMap((t) => t.acceptedMimeTypes))
);
