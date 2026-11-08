import { serve } from "@hono/node-server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createAuth } from "./auth/create-auth.js";
import { createApp } from "./app.js";
import * as schema from "./db/schema.js";
import { parseEnv } from "./env.js";
import { startJobScheduler } from "./jobs/scheduler.js";
import { advanceJobs } from "./jobs/worker.js";
import { logError, logInfo } from "./logger.js";

const env = parseEnv(process.env);
const pool = new Pool({ connectionString: env.databaseUrl, max: 10 });
pool.on("error", (error: Error) => {
  logError("database pool error", { name: error.name });
});
const db = drizzle(pool, { schema });
const auth = createAuth(db, env);
const app = createApp({ db, auth, trustedOrigins: env.trustedOrigins });

let jobTableReady = false;
const jobScheduler = startJobScheduler({
  enabled: env.jobScheduler,
  advance: async () => {
    await advanceJobs(db);
    jobTableReady = true;
  },
  onError: (error) => {
    if (!jobTableReady && errorText(error).includes("does not exist")) return;
    logError("job advance failed", { name: error instanceof Error ? error.name : "unknown" });
  },
});
if (env.jobScheduler) {
  logInfo("job scheduler enabled for this single process");
} else {
  logInfo("job scheduler disabled; jobs stay at their last saved status");
}

function errorText(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current instanceof Error; depth += 1) {
    parts.push(current.message);
    current = "cause" in current ? current.cause : undefined;
  }
  return parts.join(" ");
}

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
  await jobScheduler.stop();
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
