import pg from "pg";

export default async function globalTeardown() {
  const raw = process.env.DATABASE_URL ?? "postgres://app:local-dev-only@127.0.0.1:5432/app";
  const url = new URL(raw);
  url.pathname = "/app";
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  await client.query("drop database if exists slice_e2e with (force)");
  await client.end();
}
