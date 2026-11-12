import { describe, expect, it } from "vitest";
import { createTestApp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";
import { applyMigrations } from "../../migrate.js";
import { Pool } from "pg";

describe("health", () => {
  it("HEALTH-1 reports liveness without a session", async () => {
    await withDisposableDatabase(false, async (databaseUrl) => {
      const testApp = await createTestApp(databaseUrl);
      try {
        const response = await testApp.app.request("/api/health");
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ status: "ok", service: "api" });
      } finally {
        await testApp.close();
      }
    });
  });

  it("HEALTH-2 reports unavailable readiness before migration", async () => {
    await withDisposableDatabase(false, async (databaseUrl) => {
      const testApp = await createTestApp(databaseUrl);
      try {
        const response = await testApp.app.request("/api/health/ready");
        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toMatchObject({
          status: "unavailable",
          database: "unavailable",
        });
      } finally {
        await testApp.close();
      }
    });
  });

  it("HEALTH-2 reports readiness when the schema is present", async () => {
    await withDisposableDatabase(true, async (databaseUrl) => {
      const testApp = await createTestApp(databaseUrl);
      try {
        const response = await testApp.app.request("/api/health/ready");
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
          status: "ok",
          service: "api",
          database: "ok",
        });
      } finally {
        await testApp.close();
      }
    });
  });

  it("BACK-2 keeps a user when migration runs twice", async () => {
    await withDisposableDatabase(false, async (databaseUrl) => {
      await applyMigrations(databaseUrl);
      const pool = new Pool({ connectionString: databaseUrl, max: 1 });
      const userId = crypto.randomUUID();
      try {
        await pool.query(
          `insert into "user" (id, name, email, email_verified, created_at, updated_at)
           values ($1, 'Migration', $2, true, now(), now())`,
          [userId, `${userId}@example.com`],
        );
      } finally {
        await pool.end();
      }
      await applyMigrations(databaseUrl);
      const check = new Pool({ connectionString: databaseUrl, max: 1 });
      try {
        const result = await check.query(`select name from "user" where id = $1`, [userId]);
        expect(result.rows.map((row) => row.name)).toEqual(["Migration"]);
      } finally {
        await check.end();
      }
    });
  });
});
