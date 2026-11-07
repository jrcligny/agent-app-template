import { serve } from "@hono/node-server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createAuth } from "./auth/create-auth.js";
import { createApp } from "./app.js";
import * as schema from "./db/schema.js";
import { parseEnv } from "./env.js";
import { logError, logInfo } from "./logger.js";

const env = parseEnv(process.env);
const pool = new Pool({ connectionString: env.databaseUrl, max: 10 });
const db = drizzle(pool, { schema });
const auth = createAuth(db, env);
const app = createApp({ db, auth, trustedOrigins: env.trustedOrigins });

const server = serve(
  { fetch: app.fetch, port: env.port, hostname: "0.0.0.0" },
  (info) => {
    logInfo("api listening", { port: info.port });
  },
);

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logInfo("shutting down", { signal });
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await pool.end();
  process.exit(0);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM").catch((error: unknown) => {
    logError("shutdown failed", { name: error instanceof Error ? error.name : "unknown" });
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  void shutdown("SIGINT").catch((error: unknown) => {
    logError("shutdown failed", { name: error instanceof Error ? error.name : "unknown" });
    process.exit(1);
  });
});
