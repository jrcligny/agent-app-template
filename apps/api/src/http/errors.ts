import { errorBodySchema, type ErrorBody } from "@agent-app/contracts";
import type { Context } from "hono";

export function errorJson(
  c: Context,
  status: 400 | 401 | 403 | 404 | 500 | 503,
  code: ErrorBody["error"]["code"],
  message: string,
) {
  return c.json(errorBodySchema.parse({ error: { code, message } }), status);
}
