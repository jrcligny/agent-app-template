import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { parseEnv } from "../env.js";
import { createAuth } from "../auth/create-auth.js";
import { createApp } from "../app.js";
import * as schema from "../db/schema.js";
import { assertDisposableDatabase, ignoreAdminShutdown } from "./database.js";

export const testOrigin = "http://127.0.0.1:4173";

export async function createTestApp(databaseUrl: string) {
  assertDisposableDatabase(databaseUrl);
  const env = parseEnv({
    NODE_ENV: "test",
    PORT: "3000",
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: "ci-only-secret-minimum-32-characters",
    BETTER_AUTH_URL: testOrigin,
    TRUSTED_ORIGINS: `${testOrigin},http://localhost:5173`,
    SECURE_COOKIES: "false",
  });
  const pool = new Pool({ connectionString: databaseUrl, max: 4 });
  ignoreAdminShutdown(pool);
  const db = drizzle(pool, { schema });
  const auth = createAuth(db, env);
  const app = createApp({ db, auth, trustedOrigins: env.trustedOrigins });
  return {
    app,
    db,
    async close() {
      await pool.end();
    },
  };
}

type Requestable = {
  request: (input: string, init?: RequestInit) => Response | Promise<Response>;
};

export async function signUp(
  app: Requestable,
  user: { email: string; password: string; name: string },
) {
  const response = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json", origin: testOrigin },
    body: JSON.stringify(user),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`sign-up failed ${response.status}: ${text}`);
  }
  const setCookie = response.headers.getSetCookie();
  const cookie = setCookie.map((value) => value.split(";")[0]).join("; ");
  if (!cookie) {
    throw new Error(`sign-up returned no cookie: ${text}`);
  }
  const parsed = JSON.parse(text) as { user?: { id?: string } };
  const userId = parsed.user?.id;
  if (!userId) {
    throw new Error("sign-up returned no user id");
  }
  return { cookie, setCookie, body: text, userId };
}

export function credentialed(cookie: string, extra?: Record<string, string>): Record<string, string> {
  return { cookie, origin: testOrigin, ...extra };
}
