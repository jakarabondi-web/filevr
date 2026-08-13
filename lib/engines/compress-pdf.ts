import { stat } from "node:fs/promises";
import { join } from "node:path";
import { runCommand, CommandError } from "@/lib/engines/run-command";
import { ghostscriptReportedFailure, pdfPageCount } from "@/lib/engines/pdf-info";
import { EngineError, type ConversionEngine, type EngineContext, type EngineInput } from "@/lib/engines/types";

/** Ghostscript presets, coarsest to finest. */
const QUALITY_PRESETS = {
  small: "/screen", // 72 dpi images
  balanced: "/ebook", // 150 dpi
  high: "/printer", // 300 dpi
} as const;

export type CompressQuality = keyof typeof QUALITY_PRESETS;

function presetFor(configuration: Record<string, unknown>): string {
  const quality = configuration.quality;
  if (typeof quality === "string" && quality in QUALITY_PRESETS) {
    return QUALITY_PRESETS[quality as CompressQuality];
  }
  return QUALITY_PRESETS.balanced;
}

/**
 * Compresses a PDF with Ghostscript.
 *
 * Ghostscript has a long history of RCE vulnerabilities, so it runs with
 * -dSAFER (no file access outside the job) and a hard timeout, and the worker
 * container adds isolation on top. Never remove -dSAFER.
 */
export const compressPdfEngine: ConversionEngine = {
  toolSlug: "compress-pdf",
  minInputs: 1,
  maxInputs: 1,

  async run(inputs: EngineInput[], ctx: EngineContext) {
    const input = inputs[0];
    const outputPath = join(ctx.workDir, "compressed.pdf");

    ctx.onProgress(5);

    // Establish the page count up front: it is the yardstick for whether the
    // compression preserved the document.
    const inputPages = await pdfPageCount(input.path);
    if (inputPages === null) {
      throw new EngineError(
        "We couldn't read this PDF. It may be damaged or password-protected.",
        "UNREADABLE_INPUT",
        false
      );
    }

    ctx.onProgress(10);
    let gsOutput = "";

    try {
      const { stdout, stderr } = await runCommand(
        "gs",
        [
          "-sDEVICE=pdfwrite",
          "-dCompatibilityLevel=1.4",
          `-dPDFSETTINGS=${presetFor(ctx.configuration)}`,
          "-dNOPAUSE",
          "-dQUIET",
          "-dBATCH",
          // Refuses to read or write outside what is explicitly passed.
          "-dSAFER",
          `-sOutputFile=${outputPath}`,
          input.path,
        ],
        { timeoutMs: ctx.timeoutMs, cwd: ctx.workDir }
      );
      gsOutput = `${stdout}\n${stderr}`;
    } catch (err) {
      if (err instanceof CommandError) {
        if (err.code === "TIMEOUT") {
          throw new EngineError(
            "This PDF took too long to compress. It may be unusually complex.",
            "ENGINE_TIMEOUT",
            false
          );
        }
        if (err.code === "SPAWN_FAILED") {
          // Missing binary is an infrastructure fault, so retrying is sane.
          throw new EngineError("The compression engine is unavailable.", "ENGINE_UNAVAILABLE", true);
        }
        throw new EngineError(
          "We couldn't compress this PDF. It may be damaged or password-protected.",
          "ENGINE_FAILED",
          false
        );
      }
      throw err;
    }

    ctx.onProgress(70);

    // Ghostscript exits 0 on input it could not read, so its own diagnostics
    // and the resulting page count are the real success signal.
    if (ghostscriptReportedFailure(gsOutput)) {
      throw new EngineError(
        "We couldn't compress this PDF. It may be damaged or password-protected.",
        "ENGINE_FAILED",
        false
      );
    }

    const info = await stat(outputPath).catch(() => null);
    if (!info || info.size === 0) {
      throw new EngineError("Compression produced an empty file.", "EMPTY_OUTPUT", false);
    }

    const outputPages = await pdfPageCount(outputPath);
    if (outputPages === null || outputPages !== inputPages) {
      throw new EngineError(
        "Compression didn't preserve this document, so we stopped rather than give you a broken file.",
        "PAGE_COUNT_MISMATCH",
        false
      );
    }

    ctx.onProgress(85);

    // Ghostscript can enlarge an already-optimised PDF. Returning something
    // bigger than the original would be a worse result than doing nothing, so
    // hand back the input instead.
    const useOriginal = info.size >= input.sizeBytes;
    ctx.onProgress(95);

    return [
      {
        path: useOriginal ? input.path : outputPath,
        filename: input.originalName.replace(/(\.pdf)?$/i, "-compressed.pdf"),
        mimeType: "application/pdf",
      },
    ];
  },
};
