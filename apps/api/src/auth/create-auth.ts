import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AppEnv } from "../env.js";
import type { Db } from "../db/types.js";
import { account, session, user, verification } from "../db/schema.js";

export function createAuth(db: Db, env: AppEnv) {
  return betterAuth({
    appName: "agent-app",
    baseURL: env.authBaseUrl,
    basePath: "/api/auth",
    secret: env.authSecret,
    trustedOrigins: env.trustedOrigins,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 8,
      updateAge: 60 * 60,
    },
    rateLimit: {
      enabled: env.nodeEnv === "production",
    },
    advanced: {
      useSecureCookies: env.secureCookies,
      defaultCookieAttributes: {
        httpOnly: true,
        secure: env.secureCookies,
        sameSite: "lax",
        path: "/",
      },
      crossSubDomainCookies: {
        enabled: false,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
