import { errorBodySchema, sessionUserSchema } from "@agent-app/contracts";
import { describe, expect, it } from "vitest";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("sessions", () => {
  it("AUTH-2 returns the account summary without a password or token", async () => {
    await withApp(async ({ app }) => {
      const account = await signUp(app, { email: uniqueEmail("me"), password, name: "Ada" });
      const response = await app.request("/api/me", { headers: credentialed(account.cookie) });
      expect(response.status).toBe(200);
      const body = sessionUserSchema.parse(await response.json());
      expect(body).toEqual({ id: expect.any(String), email: expect.stringContaining("@"), name: "Ada" });
      expect(JSON.stringify(body).toLowerCase()).not.toContain("password");
      expect(JSON.stringify(body).toLowerCase()).not.toContain("token");
    });
  });

  it("AUTH-3 sets an HttpOnly session cookie and rejects an untrusted or missing origin", async () => {
    await withApp(async ({ app }) => {
      const account = await signUp(app, { email: uniqueEmail("cookie"), password, name: "Cookie" });
      const joined = account.setCookie.join("\n");
      expect(joined.toLowerCase()).toContain("httponly");
      expect(joined.toLowerCase()).not.toContain("samesite=none");

      const rejected = await app.request("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://evil.example" },
        body: JSON.stringify({ email: uniqueEmail("evil"), password, name: "Evil" }),
      });
      expect(rejected.status).toBeGreaterThanOrEqual(400);

      const missingOrigin = await app.request("/api/auth/sign-out", {
        method: "POST",
        headers: { cookie: account.cookie },
      });
      expect(missingOrigin.status).toBe(403);
      expect(errorBodySchema.parse(await missingOrigin.json()).error.code).toBe("forbidden");
    });
  });

  it("AUTH-4 rejects the account summary after sign-out", async () => {
    await withApp(async ({ app }) => {
      const account = await signUp(app, { email: uniqueEmail("out"), password, name: "Out" });
      const signedOut = await app.request("/api/auth/sign-out", {
        method: "POST",
        headers: credentialed(account.cookie),
      });
      expect(signedOut.status).toBeLessThan(400);
      const me = await app.request("/api/me", { headers: credentialed(account.cookie) });
      expect(me.status).toBe(401);
    });
  });

  it("BACK-1 serves health and does not serve records", async () => {
    await withApp(async ({ app }) => {
      const health = await app.request("/api/health");
      expect(health.status).toBe(200);
      const records = await app.request("/api/records");
      expect(records.status).toBe(404);
    });
  });
});

async function withApp(run: (app: Awaited<ReturnType<typeof createTestApp>>) => Promise<void>) {
  await withDisposableDatabase(true, async (databaseUrl) => {
    const testApp = await createTestApp(databaseUrl);
    try {
      await run(testApp);
    } finally {
      await testApp.close();
    }
  });
}

function uniqueEmail(label: string) {
  return `${label}-${crypto.randomUUID()}@example.com`;
}
