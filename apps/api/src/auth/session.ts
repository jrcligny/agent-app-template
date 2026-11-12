import { sessionUserSchema, type SessionUser } from "@agent-app/contracts";
import type { Context } from "hono";
import type { Auth } from "./create-auth.js";
import { errorJson } from "../http/errors.js";

export async function requireUser(c: Context, auth: Auth): Promise<SessionUser | Response> {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return errorJson(c, 401, "unauthorized", "Authentication required");
  }
  const parsed = sessionUserSchema.safeParse({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });
  if (!parsed.success) {
    return errorJson(c, 401, "unauthorized", "Authentication required");
  }
  return parsed.data;
}
