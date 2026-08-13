import { join } from "node:path";
import { stat } from "node:fs/promises";
import { runCommand, CommandError } from "@/lib/engines/run-command";
import { pdfHasText, pdfPageCount } from "@/lib/engines/pdf-info";
import { EngineError, type ConversionEngine, type EngineContext, type EngineInput } from "@/lib/engines/types";

/**
 * Languages the worker image ships with. OCRmyPDF accepts `eng+deu` style
 * combinations, and each extra pack adds to the image, so this list is
 * deliberately short — widen it alongside the Dockerfile, not on its own.
 */
export const OCR_LANGUAGES = ["eng"] as const;

/** OCRmyPDF's documented exit codes, for the ones worth distinct copy. */
const EXIT_ENCRYPTED = 8;
const EXIT_MISSING_DEPENDENCY = 3;
const EXIT_INPUT_FILE_ERROR = 5;
/** A child process (usually Tesseract) failed. Often recoverable — see below. */
const EXIT_CHILD_PROCESS_ERROR = 7;

function requestedLanguage(configuration: Record<string, unknown>): string {
  const raw = configuration.language;
  if (typeof raw !== "string") return "eng";

  // Validated against the installed set rather than passed through. The
  // argument array already prevents shell injection; this prevents a caller
  // selecting a pack the image does not have, which fails deep inside Tesseract
  // with an opaque message.
  const parts = raw.split("+").filter(Boolean);
  const allowed = parts.every((p) => (OCR_LANGUAGES as readonly string[]).includes(p));
  return allowed && parts.length > 0 ? parts.join("+") : "eng";
}

/**
 * Makes a scanned PDF searchable using OCRmyPDF (Tesseract for recognition,
 * Ghostscript for rasterisation).
 *
 * Pages that already contain real text are skipped rather than re-recognised:
 * born-digital text is always better than anything OCR can produce from a
 * rendering of it, so `--force-ocr` would actively degrade mixed documents.
 */
export const ocrPdfEngine: ConversionEngine = {
  toolSlug: "ocr-pdf",
  minInputs: 1,
  maxInputs: 1,

  async run(inputs: EngineInput[], ctx: EngineContext) {
    const input = inputs[0];
    const outputPath = join(ctx.workDir, "searchable.pdf");

    ctx.onProgress(5);

    const inputPages = await pdfPageCount(input.path);
    if (inputPages === null) {
      throw new EngineError(
        "We couldn't read this PDF. It may be damaged or password-protected.",
        "UNREADABLE_INPUT",
        false
      );
    }

    const hadTextBefore = await pdfHasText(input.path);
    ctx.onProgress(12);

    // Tesseract gets most of the wall clock; leave room for rasterising and
    // reassembling the document either side of it.
    const tesseractBudgetSeconds = Math.max(30, Math.floor((ctx.timeoutMs * 0.7) / 1000));

    const baseArgs = [
      "--language",
      requestedLanguage(ctx.configuration),
      // Leave existing text alone; OCR only the pages that need it.
      "--skip-text",
      "--optimize",
      "1",
      // One Tesseract per job: the worker already runs jobs concurrently, so
      // letting each job take every core would starve the others.
      "--jobs",
      "1",
      "--tesseract-timeout",
      String(tesseractBudgetSeconds),
      "--quiet",
    ];

    /**
     * Auto-rotation and deskewing improve real scans, but --rotate-pages runs
     * Tesseract's orientation detection, which errors on any page with too few
     * characters. Real scans routinely contain blank pages, dividers, and
     * photos, and one of them must not fail the whole document — so the
     * enhanced pass is attempted first and a plain pass is the fallback.
     */
    const run = (extraArgs: string[]) =>
      runCommand("ocrmypdf", [...baseArgs, ...extraArgs, input.path, outputPath], {
        timeoutMs: ctx.timeoutMs,
        cwd: ctx.workDir,
      });

    try {
      try {
        await run(["--rotate-pages", "--deskew"]);
      } catch (enhancedErr) {
        const recoverable =
          enhancedErr instanceof CommandError &&
          enhancedErr.code === "NONZERO_EXIT" &&
          enhancedErr.exitCode === EXIT_CHILD_PROCESS_ERROR;
        if (!recoverable) throw enhancedErr;

        console.warn(`[ocr] rotation/deskew failed for ${input.originalName}; retrying without them`);
        ctx.onProgress(30);
        await run([]);
      }
    } catch (err) {
      if (err instanceof CommandError) {
        if (err.code === "TIMEOUT") {
          throw new EngineError(
            "This document took too long to read. Try a shorter file.",
            "ENGINE_TIMEOUT",
            false
          );
        }
        if (err.code === "SPAWN_FAILED") {
          throw new EngineError("The OCR engine is unavailable.", "ENGINE_UNAVAILABLE", true);
        }

        const exitCode = err.exitCode;
        if (exitCode === EXIT_ENCRYPTED) {
          throw new EngineError(
            "This PDF is password-protected. Remove the password, then try again.",
            "ENCRYPTED_INPUT",
            false
          );
        }
        if (exitCode === EXIT_MISSING_DEPENDENCY) {
          throw new EngineError("The OCR engine is misconfigured.", "ENGINE_UNAVAILABLE", true);
        }
        if (exitCode === EXIT_INPUT_FILE_ERROR) {
          throw new EngineError(
            "We couldn't read this PDF. It may be damaged.",
            "UNREADABLE_INPUT",
            false
          );
        }
        throw new EngineError(
          "We couldn't make this PDF searchable. It may be damaged or password-protected.",
          "ENGINE_FAILED",
          false
        );
      }
      throw err;
    }

    ctx.onProgress(80);

    const info = await stat(outputPath).catch(() => null);
    if (!info || info.size === 0) {
      throw new EngineError("OCR produced an empty file.", "EMPTY_OUTPUT", false);
    }

    if ((await pdfPageCount(outputPath)) !== inputPages) {
      throw new EngineError(
        "OCR didn't preserve this document, so we stopped rather than give you a broken file.",
        "PAGE_COUNT_MISMATCH",
        false
      );
    }

    // The point of the tool is a text layer. If the input had none and the
    // output still has none, Tesseract found nothing legible — say so instead
    // of returning a file that looks identical to what was uploaded.
    const hasTextAfter = await pdfHasText(outputPath);
    if (!hadTextBefore && !hasTextAfter) {
      throw new EngineError(
        "We couldn't find any readable text in this document. It may be blank, handwritten, or too low-resolution to scan.",
        "NO_TEXT_FOUND",
        false
      );
    }

    ctx.onProgress(95);

    return [
      {
        path: outputPath,
        filename: input.originalName.replace(/(\.pdf)?$/i, "-searchable.pdf"),
        mimeType: "application/pdf",
      },
    ];
  },
};
