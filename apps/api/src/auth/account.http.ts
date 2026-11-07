import type { Hono } from "hono";
import type { Auth } from "./create-auth.js";
import { requireUser } from "./session.js";

export function registerAccountRoutes(app: Hono, auth: Auth): void {
  app.get("/api/me", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) {
      return user;
    }
    return c.json(user);
  });
}
