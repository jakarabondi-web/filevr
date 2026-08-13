import { execFile, type ExecFileException } from "node:child_process";

export class CommandError extends Error {
  constructor(
    message: string,
    readonly code: "TIMEOUT" | "NONZERO_EXIT" | "OUTPUT_TOO_LARGE" | "SPAWN_FAILED",
    readonly stderr?: string
  ) {
    super(message);
    this.name = "CommandError";
  }
}

export interface RunOptions {
  /** Hard wall-clock ceiling. A crafted file must not pin a worker forever. */
  timeoutMs: number;
  /** Cap on captured stdout/stderr, guarding against runaway logging. */
  maxOutputBytes?: number;
  cwd?: string;
}

/**
 * Runs a conversion binary with the argument list passed as an array — never a
 * shell string — so a filename can never be interpreted as shell syntax.
 *
 * This is the only place the app executes external binaries. Every engine goes
 * through it, which keeps the timeout and environment policy in one auditable
 * spot. Container-level isolation (no egress, read-only root, dropped caps) is
 * declared in the worker Dockerfile; this covers what the process can do.
 */
export async function runCommand(
  binary: string,
  args: string[],
  { timeoutMs, maxOutputBytes = 1024 * 1024, cwd }: RunOptions
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      binary,
      args,
      {
        timeout: timeoutMs,
        maxBuffer: maxOutputBytes,
        cwd,
        killSignal: "SIGKILL",
        encoding: "utf8" as const,
        // Minimal environment: nothing inherited that a compromised binary
        // could read (credentials, connection strings, tokens).
        env: {
          PATH: "/usr/local/bin:/usr/bin:/bin",
          HOME: cwd ?? "/tmp",
          LC_ALL: "C",
          // LibreOffice writes a profile; keep it inside the scratch directory.
          TMPDIR: cwd ?? "/tmp",
          NODE_ENV: process.env.NODE_ENV,
        },
      },
      (error: ExecFileException | null, stdout: string, stderr: string) => {
        if (error) {
          const err = error as NodeJS.ErrnoException & { killed?: boolean; signal?: string };

          if (err.killed || err.signal === "SIGKILL") {
            reject(new CommandError(`${binary} exceeded ${timeoutMs}ms`, "TIMEOUT", String(stderr)));
            return;
          }
          if (err.code === "ENOENT") {
            reject(new CommandError(`${binary} is not installed`, "SPAWN_FAILED", String(stderr)));
            return;
          }
          if (String(error.message).includes("maxBuffer")) {
            reject(new CommandError(`${binary} produced too much output`, "OUTPUT_TOO_LARGE"));
            return;
          }
          reject(new CommandError(`${binary} failed: ${error.message}`, "NONZERO_EXIT", String(stderr)));
          return;
        }
        resolve({ stdout: String(stdout), stderr: String(stderr) });
      }
    );

    child.on("error", (err) => reject(new CommandError(err.message, "SPAWN_FAILED")));
  });
}
