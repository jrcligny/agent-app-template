import { z } from "zod";

const nodeEnvSchema = z.enum(["development", "test", "production"]);

const PLACEHOLDER_SECRETS = new Set([
  "replace-with-a-random-string-of-at-least-32-chars",
  "local-dev-only-secret-minimum-32-chars",
  "ci-only-secret-minimum-32-characters",
]);

const LOCAL_DATABASE_PASSWORDS = new Set([
  "local-dev-only",
  "ci-only",
  "postgres",
  "password",
  "changeme",
  "change_me",
]);

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

export type NodeEnv = z.infer<typeof nodeEnvSchema>;

export type AppEnv = {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl: string;
  authSecret: string;
  authBaseUrl: string;
  trustedOrigins: string[];
  secureCookies: boolean;
};

export function parseEnv(source: Record<string, string | undefined>): AppEnv {
  const nodeEnv = nodeEnvSchema.parse(source.NODE_ENV ?? "development");
  const port = z.coerce.number().int().min(1).max(65535).parse(source.PORT ?? "3000");
  const databaseUrl = z.string().min(1).parse(source.DATABASE_URL);
  const authSecret = z.string().min(32).parse(source.AUTH_SECRET);
  const authBaseUrl = z.string().url().parse(source.BETTER_AUTH_URL);
  const trustedOrigins = parseOrigins(source.TRUSTED_ORIGINS ?? "");
  const secureCookies = parseSecureCookies(source.SECURE_COOKIES, nodeEnv);
  const errors: string[] = [];

  let baseOrigin = "";
  try {
    const base = new URL(authBaseUrl);
    if (base.protocol !== "https:" && base.protocol !== "http:") {
      errors.push("BETTER_AUTH_URL must be an http or https URL");
    }
    baseOrigin = base.origin;
  } catch {
    errors.push("BETTER_AUTH_URL is not a valid URL");
  }

  if (baseOrigin && !trustedOrigins.includes(baseOrigin)) {
    errors.push("TRUSTED_ORIGINS must include the BETTER_AUTH_URL origin");
  }

  if (nodeEnv === "production") {
    if (PLACEHOLDER_SECRETS.has(authSecret) || /replace-with|local-dev-only|ci-only/i.test(authSecret)) {
      errors.push("AUTH_SECRET must not be a placeholder in production");
    }
    if (!authBaseUrl.startsWith("https://")) {
      errors.push("BETTER_AUTH_URL must use https in production");
    }
    if (!secureCookies) {
      errors.push("SECURE_COOKIES must not be disabled in production");
    }
    for (const origin of trustedOrigins) {
      if (!origin.startsWith("https://")) {
        errors.push(`Trusted origin must use https in production: ${origin}`);
      }
      const host = new URL(origin).hostname;
      if (LOOPBACK_HOSTS.has(host)) {
        errors.push(`Trusted origin must not be loopback in production: ${origin}`);
      }
    }
    if (usesLocalDatabasePassword(databaseUrl)) {
      errors.push("DATABASE_URL must not use a local or placeholder password in production");
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return {
    nodeEnv,
    port,
    databaseUrl,
    authSecret,
    authBaseUrl,
    trustedOrigins,
      secureCookies,
    };
}

export function parseDatabaseUrl(source: Record<string, string | undefined>): string {
  const databaseUrl = z.string().min(1).parse(source.DATABASE_URL);
  const nodeEnv = source.NODE_ENV ?? "development";
  if (nodeEnv === "production" && usesLocalDatabasePassword(databaseUrl)) {
    throw new Error("DATABASE_URL must not use a local or placeholder password in production");
  }
  return databaseUrl;
}

export function usesLocalDatabasePassword(databaseUrl: string): boolean {
  const password = decodeURIComponent(new URL(databaseUrl).password);
  return LOCAL_DATABASE_PASSWORDS.has(password.toLowerCase());
}

function parseSecureCookies(value: string | undefined, nodeEnv: NodeEnv): boolean {
  if (value === undefined || value === "") {
    return nodeEnv === "production";
  }
  if (value !== "true" && value !== "false") {
    throw new Error("SECURE_COOKIES must be true or false");
  }
  return value === "true";
}

function parseOrigins(value: string): string[] {
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    throw new Error("TRUSTED_ORIGINS must list at least one origin");
  }
  const origins: string[] = [];
  for (const part of parts) {
    if (part.includes("*")) {
      throw new Error("TRUSTED_ORIGINS must not contain a wildcard");
    }
    let url: URL;
    try {
      url = new URL(part);
    } catch {
      throw new Error(`Invalid trusted origin: ${part}`);
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error(`Trusted origin must be http or https: ${part}`);
    }
    if (url.username || url.password) {
      throw new Error(`Trusted origin must not include credentials: ${part}`);
    }
    if (url.pathname !== "/" && url.pathname !== "") {
      throw new Error(`Trusted origin must not include a path: ${part}`);
    }
    if (url.search || url.hash) {
      throw new Error(`Trusted origin must not include a query or hash: ${part}`);
    }
    origins.push(url.origin);
  }
  return [...new Set(origins)];
}
