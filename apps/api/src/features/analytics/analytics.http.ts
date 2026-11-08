import { analyticsReportSchema, analyticsTimeZoneSchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import { z } from "zod";
import { AccessDeniedError } from "../../access/record-access.js";
import { AnalyticsWindowError, reportAnalytics, seedAlphaFixture } from "../../analytics/aggregate.js";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";

const querySchema = z
  .object({
    from: z.string().datetime(),
    to: z.string().datetime(),
    timeZone: analyticsTimeZoneSchema.default("Europe/Paris"),
    category: z.string().trim().min(1).max(80).optional(),
    status: z.enum(["open", "closed"]).optional(),
  })
  .refine((value) => new Date(value.from).getTime() < new Date(value.to).getTime(), {
    message: "The window start must be before the end",
  });

export function registerAnalyticsRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/analytics", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = querySchema.safeParse({
      from: emptyAsUndefined(c.req.query("from")),
      to: emptyAsUndefined(c.req.query("to")),
      timeZone: emptyAsUndefined(c.req.query("timeZone")),
      category: emptyAsUndefined(c.req.query("category")),
      status: emptyAsUndefined(c.req.query("status")),
    });
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose a window whose start is before its end.");
    try {
      const report = await reportAnalytics(db, user.id, {
        from: new Date(parsed.data.from),
        to: new Date(parsed.data.to),
        timeZone: parsed.data.timeZone,
        category: parsed.data.category,
        status: parsed.data.status,
      });
      return c.json(analyticsReportSchema.parse(report));
    } catch (error) {
      return mapAnalyticsError(c, error);
    }
  });

  app.post("/api/analytics/fixture", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z.object({ name: z.literal("alpha") }).safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "The only labeled fixture is alpha.");
    try {
      await seedAlphaFixture(db, user.id);
      return c.json({ fixture: "alpha", synthetic: true });
    } catch (error) {
      return mapAnalyticsError(c, error);
    }
  });
}

function mapAnalyticsError(c: Context, error: unknown): Response {
  if (error instanceof AccessDeniedError) return errorJson(c, 403, "forbidden", error.message);
  if (error instanceof AnalyticsWindowError) {
    return errorJson(c, 400, "validation", "Choose a window whose start is before its end.");
  }
  throw error;
}

function emptyAsUndefined(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}
