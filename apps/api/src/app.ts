import { Hono } from "hono";
import { registerAccountRoutes } from "./auth/account.http.js";
import type { Auth } from "./auth/create-auth.js";
import type { Db } from "./db/types.js";
import { registerHealthRoutes } from "./features/health/health.http.js";
import { registerActivityRoutes } from "./features/activity/activity.http.js";
import { registerCurationRoutes } from "./features/curation/curation.http.js";
import { registerEvidenceRoutes } from "./features/evidence/evidence.http.js";
import { registerAnalyticsRoutes } from "./features/analytics/analytics.http.js";
import { registerJobRoutes } from "./features/jobs/jobs.http.js";
import { registerNoteRoutes } from "./features/notes/notes.http.js";
import { registerRecordRoutes } from "./features/records/records.http.js";
import { registerSettingsRoutes } from "./features/settings/settings.http.js";
import { registerComparisonRoutes } from "./features/comparison/comparison.http.js";
import { registerHierarchyRoutes } from "./features/hierarchy/hierarchy.http.js";
import { registerSnapshotRoutes } from "./features/snapshots/snapshots.http.js";
import { errorJson } from "./http/errors.js";
import { logError } from "./logger.js";

export function createApp(deps: { db: Db; auth: Auth; trustedOrigins: readonly string[] }) {
  const app = new Hono();
  app.use("/api/*", async (c, next) => {
    const method = c.req.method;
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      await next();
      return;
    }
    const origin = c.req.header("origin");
    const hasSessionCookie = Boolean(c.req.header("cookie"));
    if (hasSessionCookie && !origin) {
      return errorJson(c, 403, "forbidden", "Origin is required");
    }
    if (origin && !deps.trustedOrigins.includes(origin)) {
      return errorJson(c, 403, "forbidden", "Origin is not allowed");
    }
    await next();
  });
  registerHealthRoutes(app, deps.db);
  app.on(["GET", "POST"], "/api/auth/*", (c) => deps.auth.handler(c.req.raw));
  registerAccountRoutes(app, deps.auth);
  registerNoteRoutes(app, deps.db, deps.auth);
  registerRecordRoutes(app, deps.db, deps.auth);
  registerJobRoutes(app, deps.db, deps.auth);
  registerActivityRoutes(app, deps.db, deps.auth);
  registerSettingsRoutes(app, deps.db, deps.auth);
  registerAnalyticsRoutes(app, deps.db, deps.auth);
  registerCurationRoutes(app, deps.db, deps.auth);
  registerEvidenceRoutes(app, deps.db, deps.auth);
  registerSnapshotRoutes(app, deps.db, deps.auth);
  registerComparisonRoutes(app, deps.db, deps.auth);
  registerHierarchyRoutes(app, deps.db, deps.auth);
  app.notFound((c) => errorJson(c, 404, "not_found", "Not found"));
  app.onError((error, c) => {
      logError("request failed", { path: c.req.path, name: error.name });
    return errorJson(c, 500, "internal", "Internal error");
  });
  return app;
}
