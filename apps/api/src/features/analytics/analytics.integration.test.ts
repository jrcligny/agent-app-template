import { analyticsReportSchema, errorBodySchema, recordPageSchema } from "@agent-app/contracts";
import { describe, expect, it } from "vitest";
import { recordPermission } from "../../db/schema.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";
const from = "2026-01-15T00:00:00.000Z";
const to = "2026-01-16T00:00:00.000Z";

describe("analytics", () => {
  it("OBS-1 matches the fixture totals and the Paris day bucket", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("obs"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("obs-other"), password, name: "Other" });
      expect((await loadFixture(app, owner.cookie)).status).toBe(200);
      expect((await loadFixture(app, owner.cookie)).status).toBe(200);

      const utc = analyticsReportSchema.parse(await readReport(app, owner.cookie, "UTC"));
      expect(utc.totals).toEqual({ count: 3, sum: 10, openCount: 2, closedCount: 1 });
      expect(utc.countSeries.map((point) => point.day)).toEqual(["2026-01-15"]);
      expect(utc.countSeries[0]?.count).toBe(3);

      const paris = analyticsReportSchema.parse(await readReport(app, owner.cookie, "Europe/Paris"));
      expect(paris.countSeries.map((point) => point.day)).toEqual(["2026-01-15", "2026-01-16"]);
      expect(paris.countSeries.find((point) => point.day === "2026-01-16")?.count).toBe(1);
      expect(paris.valueSeries.map((point) => point.day)).toEqual(["2026-01-15", "2026-01-16"]);

      const otherReport = analyticsReportSchema.parse(await readReport(app, other.cookie, "UTC"));
      expect(otherReport.totals.count).toBe(0);

      const drilled = await app.request(
        `/api/records?status=closed&category=beta&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        { headers: credentialed(owner.cookie) },
      );
      const page = recordPageSchema.parse(await drilled.json());
      expect(page.records.map((record) => record.title)).toEqual(["Fixture alpha closed"]);
      const hidden = await app.request(
        `/api/records?status=closed&category=beta&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        { headers: credentialed(other.cookie) },
      );
      expect(recordPageSchema.parse(await hidden.json()).records).toEqual([]);
    });
  });

  it("AN-1 returns zero only for a successful empty count", async () => {
    await withApp(async ({ app, db }) => {
      const owner = await signUp(app, { email: uniqueEmail("an1"), password, name: "Owner" });
      await loadFixture(app, owner.cookie);
      const emptyFrom = "2026-02-01T00:00:00.000Z";
      const emptyTo = "2026-02-03T00:00:00.000Z";
      const empty = analyticsReportSchema.parse(
        await (await app.request(reportPath(emptyFrom, emptyTo, "UTC"), { headers: credentialed(owner.cookie) })).json(),
      );
      expect(empty.totals).toEqual({ count: 0, sum: 0, openCount: 0, closedCount: 0 });
      expect(empty.countSeries.map((point) => point.count)).toEqual([0, 0]);
      expect(empty.valueSeries).toEqual([]);
      expect(empty.baseline.deltaCount).toBeNull();

      const wide = analyticsReportSchema.parse(
        await (
          await app.request(reportPath(from, "2026-01-17T00:00:00.000Z", "UTC"), {
            headers: credentialed(owner.cookie),
          })
        ).json(),
      );
      expect(wide.countSeries).toEqual([
        { day: "2026-01-15", count: 3 },
        { day: "2026-01-16", count: 0 },
      ]);
      expect(wide.valueSeries).toEqual([{ day: "2026-01-15", sum: 10 }]);

      await db.insert(recordPermission).values({ userId: owner.userId, canView: false, canDelete: false });
      const forbidden = await app.request(reportPath(from, to, "UTC"), { headers: credentialed(owner.cookie) });
      expect(forbidden.status).toBe(403);
      const body = JSON.stringify(errorBodySchema.parse(await forbidden.json()));
      expect(body).not.toContain("\"count\":0");
    });
  });

  it("AN-3 rejects a window whose start is not before its end", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("an3"), password, name: "Owner" });
      const response = await app.request(reportPath(to, from, "UTC"), { headers: credentialed(owner.cookie) });
      expect(response.status).toBe(400);
      expect(errorBodySchema.parse(await response.json()).error.code).toBe("validation");
    });
  });
});

function reportPath(start: string, end: string, timeZone: string): string {
  return `/api/analytics?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}&timeZone=${encodeURIComponent(timeZone)}`;
}

async function readReport(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  timeZone: string,
) {
  const response = await app.request(reportPath(from, to, timeZone), { headers: credentialed(cookie) });
  expect(response.status).toBe(200);
  return response.json();
}

async function loadFixture(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
) {
  return app.request("/api/analytics/fixture", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ name: "alpha" }),
  });
}

function uniqueEmail(label: string): string {
  return `${label}-${crypto.randomUUID()}@example.com`;
}

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
