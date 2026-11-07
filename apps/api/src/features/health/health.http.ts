import { healthResponseSchema, readinessResponseSchema } from "@agent-app/contracts";
import type { Hono } from "hono";
import type { Db } from "../../db/types.js";
import { databaseReady } from "./health.service.js";

export function registerHealthRoutes(app: Hono, db: Db): void {
  app.get("/api/health", (c) => {
    return c.json(healthResponseSchema.parse({ status: "ok", service: "api" }));
  });

  app.get("/api/health/ready", async (c) => {
    const ready = await databaseReady(db);
    if (!ready) {
      return c.json(
        readinessResponseSchema.parse({
          status: "unavailable",
          service: "api",
          database: "unavailable",
        }),
        503,
      );
    }
    return c.json(readinessResponseSchema.parse({ status: "ok", service: "api", database: "ok" }));
  });
}
