import { bucketSchema, snapshotDiffSchema, windowDiffSchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import { z } from "zod";
import { AccessDeniedError } from "../../access/record-access.js";
import { AnalyticsWindowError } from "../../analytics/aggregate.js";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import { bucketInstant, compareSnapshots, compareWindows } from "../../comparison/compare.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";
import { SnapshotNotFoundError } from "../../snapshots/store.js";

const zone = z.enum(["UTC", "Europe/Paris"]);
const grain = z.enum(["hour", "day"]);

export function registerComparisonRoutes(app: Hono, db: Db, auth: Auth): void {
  app.post("/api/comparisons/snapshots", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z.object({ baselineId: z.string().uuid(), laterId: z.string().uuid() }).safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose two snapshots.");
    try {
      return c.json(snapshotDiffSchema.parse(await compareSnapshots(db, user.id, parsed.data.baselineId, parsed.data.laterId)));
    } catch (error) {
      return mapError(c, error);
    }
  });

  app.post("/api/comparisons/windows", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z
      .object({
        leftFrom: z.string().datetime(),
        leftTo: z.string().datetime(),
        rightFrom: z.string().datetime(),
        rightTo: z.string().datetime(),
        timeZone: zone.default("Europe/Paris"),
        granularity: grain.default("day"),
      })
      .safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose a window whose start is before its end.");
    try {
      return c.json(
        windowDiffSchema.parse(
          await compareWindows(db, user.id, {
            leftFrom: new Date(parsed.data.leftFrom),
            leftTo: new Date(parsed.data.leftTo),
            rightFrom: new Date(parsed.data.rightFrom),
            rightTo: new Date(parsed.data.rightTo),
            timeZone: parsed.data.timeZone,
            granularity: parsed.data.granularity,
          }),
        ),
      );
    } catch (error) {
      return mapError(c, error);
    }
  });

  app.get("/api/comparisons/buckets", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z
      .object({ at: z.string().datetime(), timeZone: zone, granularity: grain })
      .safeParse({ at: c.req.query("at"), timeZone: c.req.query("timeZone"), granularity: c.req.query("granularity") });
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose a time, a zone, and hour or day.");
    try {
      const label = await bucketInstant(db, new Date(parsed.data.at), parsed.data.timeZone, parsed.data.granularity);
      return c.json(bucketSchema.parse({ ...parsed.data, label }));
    } catch (error) {
      return mapError(c, error);
    }
  });
}

function mapError(c: Context, error: unknown): Response {
  if (error instanceof AccessDeniedError) return errorJson(c, 403, "forbidden", error.message);
  if (error instanceof SnapshotNotFoundError) return errorJson(c, 404, "not_found", error.message);
  if (error instanceof AnalyticsWindowError) return errorJson(c, 400, "validation", error.message);
  throw error;
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}
