import { stat } from "node:fs/promises";
import { join } from "node:path";
import { runCommand, CommandError } from "@/lib/engines/run-command";
import { pdfPageCount } from "@/lib/engines/pdf-info";
import { EngineError, type ConversionEngine, type EngineContext, type EngineInput } from "@/lib/engines/types";

/**
 * Merges PDFs with qpdf, preserving the order the user selected them in.
 * qpdf is a pure PDF manipulator with no rendering engine, so it carries a far
 * smaller attack surface than Ghostscript for this operation.
 */
export const mergePdfEngine: ConversionEngine = {
  toolSlug: "merge-pdf",
  minInputs: 2,
  maxInputs: 20,

  async run(inputs: EngineInput[], ctx: EngineContext) {
    const outputPath = join(ctx.workDir, "merged.pdf");
    ctx.onProgress(5);

    // Every input must be readable, and their total is what the merged file
    // has to contain — a silently dropped document would be worse than an error.
    let expectedPages = 0;
    for (const input of inputs) {
      const pages = await pdfPageCount(input.path);
      if (pages === null) {
        throw new EngineError(
          `We couldn't read ${input.originalName}. It may be damaged or password-protected.`,
          "UNREADABLE_INPUT",
          false
        );
      }
      expectedPages += pages;
    }

    ctx.onProgress(15);

    try {
      await runCommand(
        "qpdf",
        ["--empty", "--pages", ...inputs.map((i) => i.path), "--", outputPath],
        { timeoutMs: ctx.timeoutMs, cwd: ctx.workDir }
      );
    } catch (err) {
      if (err instanceof CommandError) {
        if (err.code === "TIMEOUT") {
          throw new EngineError("Merging took too long. Try fewer files.", "ENGINE_TIMEOUT", false);
        }
        if (err.code === "SPAWN_FAILED") {
          throw new EngineError("The merge engine is unavailable.", "ENGINE_UNAVAILABLE", true);
        }
        // qpdf exits 3 on warnings while still producing valid output.
        const recovered = await stat(outputPath).catch(() => null);
        if (!recovered || recovered.size === 0) {
          throw new EngineError(
            "We couldn't merge these PDFs. One may be damaged or password-protected.",
            "ENGINE_FAILED",
            false
          );
        }
      } else {
        throw err;
      }
    }

    ctx.onProgress(80);

    const info = await stat(outputPath).catch(() => null);
    if (!info || info.size === 0) {
      throw new EngineError("Merging produced an empty file.", "EMPTY_OUTPUT", false);
    }

    const mergedPages = await pdfPageCount(outputPath);
    if (mergedPages !== expectedPages) {
      throw new EngineError(
        "The merged file didn't come out with all the pages, so we stopped rather than give you an incomplete document.",
        "PAGE_COUNT_MISMATCH",
        false
      );
    }

    ctx.onProgress(90);

    return [{ path: outputPath, filename: "merged.pdf", mimeType: "application/pdf" }];
  },
};
