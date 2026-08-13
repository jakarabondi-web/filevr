import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

/**
 * Single pooled connection reused across hot reloads. Next.js re-evaluates
 * modules on every edit in dev, so without the global cache each reload would
 * open a new pool and exhaust Postgres connections.
 */
const globalForDb = globalThis as unknown as {
  __filevrSql?: ReturnType<typeof postgres>;
};

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at a Postgres instance."
    );
  }
  return url;
}

const sql =
  globalForDb.__filevrSql ??
  postgres(connectionString(), {
    max: 10,
    idle_timeout: 20,
    // Vercel/serverless terminate sockets aggressively; fail fast rather than hang.
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__filevrSql = sql;

export const db = drizzle(sql, { schema });
export { schema };
