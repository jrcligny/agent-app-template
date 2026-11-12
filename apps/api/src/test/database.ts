import { randomBytes } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool, type Pool as PgPool } from "pg";
import { migrationsFolder } from "../migrate.js";

const DISPOSABLE = /^(slice_[a-z0-9]+)$/;

export function assertDisposableDatabase(databaseUrl: string): void {
  const url = new URL(databaseUrl);
  if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
    throw new Error("Refusing to run tests against a non-local database");
  }
  const name = url.pathname.replace(/^\//, "");
  if (!DISPOSABLE.test(name)) {
    throw new Error(`Refusing to use database "${name}". Tests only use slice_* databases.`);
  }
}

export function adminDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL ?? "postgres://app:local-dev-only@127.0.0.1:5432/app";
  const url = new URL(raw);
  if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
    throw new Error("Refusing to administer a non-local database");
  }
  url.pathname = "/app";
  return url.toString();
}

export function databaseUrlFor(name: string): string {
  const url = new URL(adminDatabaseUrl());
  url.pathname = `/${name}`;
  return url.toString();
}

export async function withDisposableDatabase(
  applySchema: boolean,
  run: (databaseUrl: string) => Promise<void>,
): Promise<void> {
  const admin = new Pool({ connectionString: adminDatabaseUrl(), max: 1 });
  ignoreAdminShutdown(admin);
  const name = `slice_${randomBytes(4).toString("hex")}`;
  const databaseUrl = databaseUrlFor(name);
  assertDisposableDatabase(databaseUrl);
  await admin.query(`create database ${name}`);
  try {
    if (applySchema) {
      const pool = new Pool({ connectionString: databaseUrl, max: 1 });
      ignoreAdminShutdown(pool);
      try {
        await migrate(drizzle(pool), { migrationsFolder: migrationsFolder() });
      } finally {
        await pool.end();
      }
    }
    await run(databaseUrl);
  } finally {
    await admin.query(`drop database if exists ${name} with (force)`);
    await admin.end();
  }
}

export function ignoreAdminShutdown(pool: PgPool): void {
  pool.on("error", (error: Error & { code?: string }) => {
    if (error.code === "57P01") return;
    throw error;
  });
}
