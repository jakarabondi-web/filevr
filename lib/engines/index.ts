import { compressPdfEngine } from "@/lib/engines/compress-pdf";
import { mergePdfEngine } from "@/lib/engines/merge-pdf";
import type { ConversionEngine } from "@/lib/engines/types";
import { TOOLS_WITH_ENGINES } from "@/config/tools";

export type { ConversionEngine, EngineContext, EngineInput, EngineOutput } from "@/lib/engines/types";
export { EngineError } from "@/lib/engines/types";

/**
 * Tools with a working engine. A tool absent from this map is still mocked:
 * the worker passes its input through unchanged rather than pretending to
 * convert. See docs/backend-conversion-scope.md for the remaining phases.
 */
const ENGINES = new Map<string, ConversionEngine>([
  [compressPdfEngine.toolSlug, compressPdfEngine],
  [mergePdfEngine.toolSlug, mergePdfEngine],
]);

export function getEngine(toolSlug: string): ConversionEngine | undefined {
  return ENGINES.get(toolSlug);
}

export function hasRealEngine(toolSlug: string): boolean {
  return ENGINES.has(toolSlug);
}

export const IMPLEMENTED_TOOL_SLUGS = [...ENGINES.keys()];

// The client bundle cannot import this module, so config/tools.ts carries its
// own copy of the list. Fail loudly at startup if the two drift apart.
if (process.env.NODE_ENV !== "production") {
  const declared = [...TOOLS_WITH_ENGINES].sort().join(",");
  const actual = [...ENGINES.keys()].sort().join(",");
  if (declared !== actual) {
    throw new Error(
      `TOOLS_WITH_ENGINES (${declared}) does not match the engine registry (${actual}). Update config/tools.ts.`
    );
  }
}
