import { activityPageSchema, errorBodySchema, jobSchema, recordPageSchema, recordSchema } from "@agent-app/contracts";
import { describe, expect, it } from "vitest";
import { recordPermission } from "../../db/schema.js";
import { advanceJobs } from "../../jobs/worker.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("jobs", () => {
  it("JOB-1 cancels and retries only the caller's job", async () => {
    await withApp(async ({ app, db }) => {
      const owner = await signUp(app, { email: uniqueEmail("job"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("job-other"), password, name: "Other" });

      const running = await createJob(app, owner.cookie, "complete");
      await advanceJobs(db);
      const advanced = jobSchema.parse(await (await app.request(`/api/jobs/${running.id}`, { headers: credentialed(owner.cookie) })).json());
      expect(advanced.status).toBe("running");
      expect(advanced.progress).toBeGreaterThan(0);

      const cancelled = await app.request(`/api/jobs/${running.id}/cancel`, {
        method: "POST",
        headers: credentialed(owner.cookie),
      });
      expect(cancelled.status).toBe(200);
      expect(jobSchema.parse(await cancelled.json()).status).toBe("cancelled");
      await advanceJobs(db);
      await advanceJobs(db);
      const afterCancel = jobSchema.parse(
        await (await app.request(`/api/jobs/${running.id}`, { headers: credentialed(owner.cookie) })).json(),
      );
      expect(afterCancel.status).toBe("cancelled");
      expect(afterCancel.progress).toBe(advanced.progress);

      const failed = await createJob(app, owner.cookie, "fail");
      for (let tick = 0; tick < 6 && jobSchema.parse(await readJob(app, owner.cookie, failed.id)).status !== "failed"; tick += 1) {
        await advanceJobs(db);
      }
      const failedJob = jobSchema.parse(await readJob(app, owner.cookie, failed.id));
      expect(failedJob.status).toBe("failed");

      const retry = await app.request(`/api/jobs/${failed.id}/retry`, {
        method: "POST",
        headers: credentialed(owner.cookie),
      });
      expect(retry.status).toBe(201);
      const next = jobSchema.parse(await retry.json());
      expect(next.id).not.toBe(failed.id);
      expect(next.attempt).toBe(2);
      expect(next.status).toBe("queued");
      expect(next.replacesJobId).toBe(failed.id);
      const stillFailed = jobSchema.parse(await readJob(app, owner.cookie, failed.id));
      expect(stillFailed.status).toBe("failed");

      const duplicate = await app.request(`/api/jobs/${failed.id}/retry`, {
        method: "POST",
        headers: credentialed(owner.cookie),
      });
      expect(duplicate.status).toBe(400);
      for (let tick = 0; tick < 6; tick += 1) await advanceJobs(db);
      const finished = jobSchema.parse(await readJob(app, owner.cookie, next.id));
      expect(finished.status).toBe("succeeded");
      expect(jobSchema.parse(await readJob(app, owner.cookie, failed.id)).status).toBe("failed");

      for (const path of [`/api/jobs/${running.id}`, `/api/jobs/${running.id}/cancel`, `/api/jobs/${failed.id}/retry`]) {
        const response = await app.request(path, {
          method: path.endsWith("/cancel") || path.endsWith("/retry") ? "POST" : "GET",
          headers: credentialed(other.cookie),
        });
        expect(response.status).toBe(404);
      }

      await db.insert(recordPermission).values({ userId: owner.userId, canView: false, canDelete: false });
      const forbidden = await app.request("/api/jobs", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ outcome: "complete" }),
      });
      expect(forbidden.status).toBe(403);
      expect(errorBodySchema.parse(await forbidden.json()).error.code).toBe("forbidden");
    });
  });
});

describe("activity and settings", () => {
  it("ACT-1 lists only the caller's events newest first", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("act"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("act-other"), password, name: "Other" });
      const empty = await app.request("/api/activity", { headers: credentialed(owner.cookie) });
      expect(empty.status).toBe(200);
      expect(activityPageSchema.parse(await empty.json()).events).toEqual([]);

      await createRecord(app, owner.cookie, "Older");
      await new Promise((resolve) => setTimeout(resolve, 20));
      await createRecord(app, owner.cookie, "Newer");
      await createRecord(app, other.cookie, "Foreign");

      const listed = await app.request("/api/activity?pageSize=10", { headers: credentialed(owner.cookie) });
      const body = activityPageSchema.parse(await listed.json());
      expect(body.events.map((event) => event.summary)).toEqual([
        'Created record "Newer"',
        'Created record "Older"',
      ]);
      expect(JSON.stringify(body)).not.toContain("Foreign");
    });
  });

  it("SET-1 saves a page size and the next record list uses it", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("set"), password, name: "Ada" });
      const invalid = await app.request("/api/settings", {
        method: "PUT",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ displayName: "   ", pageSize: 25 }),
      });
      expect(invalid.status).toBe(400);

      const saved = await app.request("/api/settings", {
        method: "PUT",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ displayName: "Ada Lovelace", pageSize: 10 }),
      });
      expect(saved.status).toBe(200);
      await createRecord(app, owner.cookie, "One");
      const listed = await app.request("/api/records", { headers: credentialed(owner.cookie) });
      const page = recordPageSchema.parse(await listed.json());
      expect(page.pageSize).toBe(10);
      expect(page.records[0]?.ownerName).toBe("Ada Lovelace");
    });
  });
});

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

async function createJob(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  outcome: "complete" | "fail",
) {
  const response = await app.request("/api/jobs", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ outcome }),
  });
  expect(response.status).toBe(201);
  return jobSchema.parse(await response.json());
}

async function readJob(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  id: string,
) {
  const response = await app.request(`/api/jobs/${id}`, { headers: credentialed(cookie) });
  expect(response.status).toBe(200);
  return response.json();
}

async function createRecord(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  title: string,
) {
  const response = await app.request("/api/records", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ title, status: "open", summary: "", body: "" }),
  });
  expect(response.status).toBe(201);
  return recordSchema.parse(await response.json());
}
