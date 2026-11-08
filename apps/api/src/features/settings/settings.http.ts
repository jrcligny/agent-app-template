import { settingsSchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";
import { readSettings, saveSettings } from "../../settings/preferences.js";

export function registerSettingsRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/settings", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    return c.json(await readSettings(db, user.id));
  });

  app.put("/api/settings", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = settingsSchema.safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Enter a display name and a page size of 10, 25, or 50.");
    return c.json(await saveSettings(db, user.id, parsed.data));
  });
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}
