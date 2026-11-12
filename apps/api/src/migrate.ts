import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { parseDatabaseUrl } from "./env.js";
import { assertForwardOnlyMigrations } from "./migration-policy.js";
import { logInfo } from "./logger.js";

export function migrationsFolder(): string {
  return path.resolve(import.meta.dirname, "../drizzle");
}

export async function applyMigrations(databaseUrl: string): Promise<void> {
  const folder = migrationsFolder();
  assertForwardOnlyMigrations(folder);
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: folder });
  } finally {
    await pool.end();
  }
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));

if (invokedDirectly) {
  const databaseUrl = parseDatabaseUrl(process.env);
  applyMigrations(databaseUrl)
    .then(() => {
      logInfo("forward migrations applied");
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "migration failed";
      console.error(JSON.stringify({ level: "error", message }));
      process.exitCode = 1;
    });
}
