import { runCommand, CommandError } from "@/lib/engines/run-command";

/**
 * Page count via qpdf, or null when the file cannot be parsed as a PDF.
 *
 * Engines use this to verify their own output. Exit codes are not enough on
 * their own: Ghostscript exits 0 even when it fails to read the input, printing
 * "Couldn't initialise file" and emitting a single garbage page. Comparing page
 * counts across the operation is what actually catches that.
 */
export async function pdfPageCount(path: string, timeoutMs = 15_000): Promise<number | null> {
  try {
    const { stdout } = await runCommand("qpdf", ["--show-npages", path], { timeoutMs });
    const count = Number.parseInt(stdout.trim(), 10);
    return Number.isFinite(count) && count > 0 ? count : null;
  } catch (err) {
    // A damaged or encrypted PDF makes qpdf exit non-zero; that is an answer.
    if (err instanceof CommandError && err.code === "NONZERO_EXIT") return null;
    if (err instanceof CommandError && err.code === "SPAWN_FAILED") throw err;
    return null;
  }
}

/** Ghostscript reports these on stdout while still exiting 0. */
const GS_FAILURE_MARKERS = [
  "Couldn't initialise file",
  "No pages will be processed",
  "Unrecoverable error",
  "is not a valid PDF",
];

export function ghostscriptReportedFailure(output: string): boolean {
  return GS_FAILURE_MARKERS.some((marker) => output.includes(marker));
}
