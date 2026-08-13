import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import zlib from "node:zlib";
import { compressPdfEngine } from "./compress-pdf";
import { mergePdfEngine } from "./merge-pdf";
import { ghostscriptReportedFailure, pdfPageCount } from "./pdf-info";
import { EngineError } from "./types";
import type { EngineContext, EngineInput } from "./types";

/**
 * These exercise the real Ghostscript and qpdf binaries rather than mocking
 * them. The whole point of the engine layer is what those tools actually do
 * with a given file, and mocks cannot tell us that — the Ghostscript
 * exits-0-on-failure behaviour these tests pin down was found this way.
 */

let workDir: string;

/** A PDF with `pages` pages, each drawing an image of `W`x`W` pixels. */
function buildPdf(pages: number, W = 900): Buffer {
  const raw = Buffer.alloc(W * W * 3);
  for (let i = 0; i < raw.length; i += 3) {
    raw[i] = i % 256;
    raw[i + 1] = (i * 7) % 256;
    raw[i + 2] = (i * 13) % 256;
  }
  const img = zlib.deflateSync(raw, { level: 6 });

  const objs: Buffer[] = [];
  objs.push(Buffer.from("<</Type/Catalog/Pages 2 0 R>>"));
  const kids = Array.from({ length: pages }, (_, i) => `${4 + i * 2} 0 R`).join(" ");
  objs.push(Buffer.from(`<</Type/Pages/Kids[${kids}]/Count ${pages}>>`));
  objs.push(
    Buffer.concat([
      Buffer.from(
        `<</Type/XObject/Subtype/Image/Width ${W}/Height ${W}/ColorSpace/DeviceRGB` +
          `/BitsPerComponent 8/Filter/FlateDecode/Length ${img.length}>>stream\n`
      ),
      img,
      Buffer.from("\nendstream"),
    ])
  );
  for (let i = 0; i < pages; i++) {
    objs.push(
      Buffer.from(
        `<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]` +
          `/Resources<</XObject<</Im0 3 0 R>>>>/Contents ${5 + i * 2} 0 R>>`
      )
    );
    const content = "q 400 0 0 400 50 200 cm /Im0 Do Q";
    objs.push(Buffer.from(`<</Length ${content.length}>>stream\n${content}\nendstream`));
  }

  let out = Buffer.from("%PDF-1.4\n");
  const offsets: number[] = [];
  objs.forEach((body, i) => {
    offsets.push(out.length);
    out = Buffer.concat([out, Buffer.from(`${i + 1} 0 obj`), body, Buffer.from("endobj\n")]);
  });
  const xref = out.length;
  let tail = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) tail += `${String(off).padStart(10, "0")} 00000 n \n`;
  tail += `trailer<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.concat([out, Buffer.from(tail)]);
}

async function writeInput(name: string, bytes: Buffer): Promise<EngineInput> {
  const path = join(workDir, name);
  await writeFile(path, bytes);
  return { path, originalName: name, mimeType: "application/pdf", sizeBytes: bytes.length };
}

function ctx(overrides: Partial<EngineContext> = {}): EngineContext {
  return {
    workDir,
    configuration: {},
    onProgress: () => {},
    timeoutMs: 30_000,
    ...overrides,
  };
}

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "filevr-engine-test-"));
});
afterAll(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe("pdfPageCount", () => {
  it("counts pages in a real PDF", async () => {
    const input = await writeInput("count.pdf", buildPdf(4));
    expect(await pdfPageCount(input.path)).toBe(4);
  });

  it("returns null for a file that is not a readable PDF", async () => {
    const input = await writeInput("broken.pdf", Buffer.from("%PDF-1.4\n" + "t".repeat(400)));
    expect(await pdfPageCount(input.path)).toBeNull();
  });
});

describe("ghostscriptReportedFailure", () => {
  // Ghostscript exits 0 while printing these, so the text is the signal.
  it("recognises the diagnostics Ghostscript prints on unreadable input", () => {
    expect(ghostscriptReportedFailure("**** Error: Couldn't initialise file.")).toBe(true);
    expect(ghostscriptReportedFailure("No pages will be processed (FirstPage > LastPage).")).toBe(true);
  });

  it("does not flag ordinary output", () => {
    expect(ghostscriptReportedFailure("Processing pages 1 through 3.")).toBe(false);
  });
});

describe("compressPdfEngine", () => {
  it("shrinks an image-heavy PDF while preserving every page", async () => {
    const original = buildPdf(3, 900);
    const input = await writeInput("compress-me.pdf", original);

    const [output] = await compressPdfEngine.run([input], ctx());
    const info = await stat(output.path);

    expect(info.size).toBeLessThan(original.length);
    expect(await pdfPageCount(output.path)).toBe(3);
    expect(output.filename).toBe("compress-me-compressed.pdf");
  });

  it("refuses a damaged PDF instead of returning it as a result", async () => {
    const input = await writeInput("damaged.pdf", Buffer.from("%PDF-1.4\n" + "t".repeat(400)));

    await expect(compressPdfEngine.run([input], ctx())).rejects.toThrow(EngineError);
    await expect(compressPdfEngine.run([input], ctx())).rejects.toMatchObject({
      code: "UNREADABLE_INPUT",
      retryable: false,
    });
  });

  it("returns the original when compressing would make the file bigger", async () => {
    // A small, already-efficient PDF: Ghostscript's rewrite costs more bytes
    // than it saves, and handing back a larger "compressed" file would be a
    // worse result than doing nothing.
    const original = buildPdf(1, 120);
    const input = await writeInput("already-small.pdf", original);

    const [output] = await compressPdfEngine.run([input], ctx());

    expect(output.path).toBe(input.path);
    expect((await stat(output.path)).size).toBe(original.length);
  });

  it("reports progress on the way through", async () => {
    const input = await writeInput("progress.pdf", buildPdf(1));
    const seen: number[] = [];

    await compressPdfEngine.run([input], ctx({ onProgress: (p) => seen.push(p) }));

    expect(seen.length).toBeGreaterThan(1);
    expect(Math.max(...seen)).toBeGreaterThanOrEqual(85);
    // Progress must never go backwards.
    expect([...seen].sort((a, b) => a - b)).toEqual(seen);
  });
});

describe("mergePdfEngine", () => {
  it("produces a file with every page from every input, in order", async () => {
    const a = await writeInput("merge-a.pdf", buildPdf(2));
    const b = await writeInput("merge-b.pdf", buildPdf(3));

    const [output] = await mergePdfEngine.run([a, b], ctx());

    expect(await pdfPageCount(output.path)).toBe(5);
    expect(output.filename).toBe("merged.pdf");
  });

  it("refuses when any input is unreadable, naming the file at fault", async () => {
    const good = await writeInput("good.pdf", buildPdf(1));
    const bad = await writeInput("bad.pdf", Buffer.from("%PDF-1.4\nnot really"));

    await expect(mergePdfEngine.run([good, bad], ctx())).rejects.toMatchObject({
      code: "UNREADABLE_INPUT",
    });
    await expect(mergePdfEngine.run([good, bad], ctx())).rejects.toThrow(/bad\.pdf/);
  });
});
