import { describe, expect, it } from "vitest";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

describe("time windows", () => {
  it("TIME-1 places 23:30Z on 16 January in Paris and 15 January in UTC", async () => {
    await withDisposableDatabase(true, async (databaseUrl) => {
      const testApp = await createTestApp(databaseUrl);
      try {
        const owner = await signUp(testApp.app, { email: `time-${crypto.randomUUID()}@example.com`, password: "correct-horse-1", name: "Owner" });
        const paris = await testApp.app.request(
          "/api/comparisons/buckets?at=2026-01-15T23:30:00.000Z&timeZone=Europe/Paris&granularity=day",
          { headers: credentialed(owner.cookie) },
        );
        const utc = await testApp.app.request(
          "/api/comparisons/buckets?at=2026-01-15T23:30:00.000Z&timeZone=UTC&granularity=day",
          { headers: credentialed(owner.cookie) },
        );
        expect(paris.status).toBe(200);
        expect(utc.status).toBe(200);
        expect(((await paris.json()) as { label: string }).label).toBe("16 January 2026");
        expect(((await utc.json()) as { label: string }).label).toBe("15 January 2026");
      } finally {
        await testApp.close();
      }
    });
  });
});
