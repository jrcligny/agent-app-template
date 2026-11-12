import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const origin = "http://127.0.0.1:4173";

function e2eDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL ?? "postgres://app:local-dev-only@127.0.0.1:5432/app";
  const url = new URL(raw);
  url.pathname = "/slice_e2e";
  return url.toString();
}

const databaseUrl = e2eDatabaseUrl();

const apiEnv = {
  ...process.env,
  NODE_ENV: "test",
  PORT: "3000",
  DATABASE_URL: databaseUrl,
  AUTH_SECRET: "ci-only-secret-minimum-32-characters",
  BETTER_AUTH_URL: origin,
  TRUSTED_ORIGINS: `${origin},http://localhost:5173`,
  SECURE_COOKIES: "false",
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  use: {
    baseURL: origin,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter @agent-app/api exec tsx src/index.ts",
      cwd: root,
      url: "http://127.0.0.1:3000/api/health",
      reuseExistingServer: false,
      env: apiEnv,
    },
    {
      command: "pnpm --filter @agent-app/web exec vite preview --host 127.0.0.1 --port 4173 --strictPort",
      cwd: root,
      url: origin,
      reuseExistingServer: false,
    },
  ],
});
