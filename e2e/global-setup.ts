import { execSync } from "node:child_process";
import path from "node:path";
import pg from "pg";

const root = path.resolve(import.meta.dirname, "..");

export default async function globalSetup() {
  const adminUrl = adminDatabaseUrl();
  const databaseUrl = databaseUrlFor("slice_e2e");
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  await client.query("drop database if exists slice_e2e with (force)");
  await client.query("create database slice_e2e");
  await client.end();
  execSync("pnpm --filter @agent-app/api migrate", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: "test" },
  });
}

function adminDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL ?? "postgres://app:local-dev-only@127.0.0.1:5432/app";
  const url = new URL(raw);
  url.pathname = "/app";
  return url.toString();
}

function databaseUrlFor(name: string): string {
  const url = new URL(adminDatabaseUrl());
  url.pathname = `/${name}`;
  return url.toString();
}
