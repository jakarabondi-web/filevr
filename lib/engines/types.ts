/**
 * A conversion engine turns input files into output files. Engines receive
 * paths inside a per-job scratch directory that the worker creates and removes;
 * they never touch storage, the database, or the network themselves.
 */
export interface EngineInput {
  path: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface EngineOutput {
  path: string;
  /** Filename shown to the user; the worker keeps the storage key opaque. */
  filename: string;
  mimeType: string;
}

export interface EngineContext {
  /** Scratch directory, removed after the job regardless of outcome. */
  workDir: string;
  configuration: Record<string, unknown>;
  /** Report 0–100. The worker throttles writes to the database. */
  onProgress: (percent: number) => void;
  /** Remaining wall-clock budget for this job. */
  timeoutMs: number;
}

export interface ConversionEngine {
  readonly toolSlug: string;
  readonly minInputs: number;
  readonly maxInputs: number;
  run(inputs: EngineInput[], ctx: EngineContext): Promise<EngineOutput[]>;
}

/** Failure that should be shown to the user rather than retried blindly. */
export class EngineError extends Error {
  constructor(
    message: string,
    readonly code: string,
    /** False for bad input: retrying identical bytes will fail identically. */
    readonly retryable = false
  ) {
    super(message);
    this.name = "EngineError";
  }
}
