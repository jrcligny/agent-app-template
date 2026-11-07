import { describe, expect, it } from "vitest";
import { parseEnv } from "./env.js";

const productionBase = {
  NODE_ENV: "production",
  PORT: "3000",
  DATABASE_URL: "postgres://app:s3cret-value@db.internal:5432/app",
  AUTH_SECRET: "production-secret-that-is-long-enough-32",
  BETTER_AUTH_URL: "https://app.example.com",
  TRUSTED_ORIGINS: "https://app.example.com",
  SECURE_COOKIES: "true",
};

describe("production auth configuration", () => {
  it("AUTH-5 accepts a https production configuration", () => {
    const env = parseEnv(productionBase);
    expect(env.secureCookies).toBe(true);
    expect(env.trustedOrigins).toEqual(["https://app.example.com"]);
  });

  it("AUTH-5 rejects an http public URL in production", () => {
    expect(() =>
      parseEnv({ ...productionBase, BETTER_AUTH_URL: "http://app.example.com", TRUSTED_ORIGINS: "http://app.example.com" }),
    ).toThrow(/https/);
  });

  it("AUTH-5 rejects a wildcard origin", () => {
    expect(() => parseEnv({ ...productionBase, TRUSTED_ORIGINS: "*" })).toThrow(/wildcard/);
  });

  it("AUTH-5 rejects loopback origins in production", () => {
    expect(() =>
      parseEnv({
        ...productionBase,
        BETTER_AUTH_URL: "https://localhost",
        TRUSTED_ORIGINS: "https://localhost",
      }),
    ).toThrow(/loopback/);
  });

  it("AUTH-5 rejects a placeholder secret in production", () => {
    expect(() =>
      parseEnv({ ...productionBase, AUTH_SECRET: "local-dev-only-secret-minimum-32-chars" }),
    ).toThrow(/placeholder/);
  });

  it("AUTH-5 rejects disabled secure cookies in production", () => {
    expect(() => parseEnv({ ...productionBase, SECURE_COOKIES: "false" })).toThrow(/SECURE_COOKIES/);
  });

  it("AUTH-5 rejects a local database password in production", () => {
    expect(() =>
      parseEnv({ ...productionBase, DATABASE_URL: "postgres://app:local-dev-only@db.internal:5432/app" }),
    ).toThrow(/DATABASE_URL/);
  });

  it("AUTH-5 allows local http origins outside production", () => {
    const env = parseEnv({
      NODE_ENV: "development",
      DATABASE_URL: "postgres://app:local-dev-only@127.0.0.1:5432/app",
      AUTH_SECRET: "local-dev-only-secret-minimum-32-chars",
      BETTER_AUTH_URL: "http://localhost:5173",
      TRUSTED_ORIGINS: "http://localhost:5173",
      SECURE_COOKIES: "false",
    });
    expect(env.secureCookies).toBe(false);
  });

  it("rejects a trusted origin that includes a path", () => {
    expect(() =>
      parseEnv({ ...productionBase, TRUSTED_ORIGINS: "https://app.example.com/api" }),
    ).toThrow(/path/);
  });
});
