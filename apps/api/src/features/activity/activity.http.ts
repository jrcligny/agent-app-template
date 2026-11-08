import type { Hono } from "hono";
import { z } from "zod";
import { AccessDeniedError, requireRecordView } from "../../access/record-access.js";
import { listEvents } from "../../activity/events.js";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";
import { pageSizeFor } from "../../settings/preferences.js";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export function registerActivityRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/activity", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = querySchema.safeParse({
      page: emptyAsUndefined(c.req.query("page")),
      pageSize: emptyAsUndefined(c.req.query("pageSize")),
    });
    if (!parsed.success) return errorJson(c, 400, "validation", "That activity page is not valid.");
    try {
      await requireRecordView(db, user.id);
      const pageSize = parsed.data.pageSize ?? (await pageSizeFor(db, user.id));
      return c.json(await listEvents(db, user.id, parsed.data.page, pageSize));
    } catch (error) {
      if (error instanceof AccessDeniedError) return errorJson(c, 403, "forbidden", error.message);
      throw error;
    }
  });
}

function emptyAsUndefined(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}
