import {
  bulkDeleteRecordsSchema,
  errorBodySchema,
  recordCountsSchema,
  recordDetailSchema,
  recordPageSchema,
  recordSchema,
} from "@agent-app/contracts";
import { describe, expect, it } from "vitest";
import { recordPermission } from "../../db/schema.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("records", () => {
  it("WB-1 returns all and open counts for records the caller can read", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("counts"), password, name: "Ada" });
      const other = await signUp(app, { email: uniqueEmail("counts-other"), password, name: "Other" });
      await createRecord(app, owner.cookie, { title: "Open one", status: "open" });
      await createRecord(app, owner.cookie, { title: "Closed", status: "closed", reason: "Done" });
      await createRecord(app, other.cookie, { title: "Someone else", status: "open" });

      const response = await app.request("/api/records/counts", { headers: credentialed(owner.cookie) });
      expect(response.status).toBe(200);
      expect(recordCountsSchema.parse(await response.json())).toEqual({ all: 2, open: 1 });
    });
  });

  it("WB-2 rejects a session that is not allowed to list records", async () => {
    await withApp(async ({ app, db }) => {
      const owner = await signUp(app, { email: uniqueEmail("denied"), password, name: "Denied" });
      const created = await createRecord(app, owner.cookie, { title: "Hidden title", status: "open" });
      await db.insert(recordPermission).values({ userId: owner.userId, canView: false, canDelete: false });

      const listed = await app.request("/api/records", { headers: credentialed(owner.cookie) });
      expect(listed.status).toBe(403);
      const body = errorBodySchema.parse(await listed.json());
      expect(body.error.code).toBe("forbidden");
      expect(JSON.stringify(body)).not.toContain("Hidden title");
      expect(JSON.stringify(body)).not.toContain("0");

      const counts = await app.request("/api/records/counts", { headers: credentialed(owner.cookie) });
      expect(counts.status).toBe(403);
      const detail = await app.request(`/api/records/${created.id}`, { headers: credentialed(owner.cookie) });
      expect(detail.status).toBe(403);
    });
  });

  it("TBL-1 returns the caller's filtered sorted page", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("table"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("table-other"), password, name: "Other" });
      await createRecord(app, owner.cookie, { title: "Alpine open", status: "open" });
      await createRecord(app, owner.cookie, { title: "Alpha open", status: "open" });
      await createRecord(app, owner.cookie, { title: "Alpine closed", status: "closed", reason: "Finished" });
      await createRecord(app, other.cookie, { title: "Alpha open", status: "open" });

      const response = await app.request(
        "/api/records?q=alp&status=open&sort=title&page=1&pageSize=1",
        { headers: credentialed(owner.cookie) },
      );
      expect(response.status).toBe(200);
      const page = recordPageSchema.parse(await response.json());
      expect(page.total).toBe(2);
      expect(page.page).toBe(1);
      expect(page.records.map((record) => record.title)).toEqual(["Alpha open"]);
      expect(page.records.every((record) => record.ownerName === "Owner")).toBe(true);

      const empty = await app.request("/api/records?q=missing-title", { headers: credentialed(owner.cookie) });
      expect(recordPageSchema.parse(await empty.json()).records).toEqual([]);
    });
  });

  it("DET-2 does not reveal another account's record", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("det-a"), password, name: "A" });
      const intruder = await signUp(app, { email: uniqueEmail("det-b"), password, name: "B" });
      const created = await createRecord(app, owner.cookie, { title: "Private", status: "open", summary: "Mine" });

      for (const method of ["GET", "PATCH", "DELETE"] as const) {
        const response = await app.request(`/api/records/${created.id}`, {
          method,
          headers: {
            ...credentialed(intruder.cookie),
            ...(method === "PATCH" ? { "content-type": "application/json" } : {}),
          },
          body: method === "PATCH" ? JSON.stringify({ title: "Stolen", status: "open", summary: "", body: "" }) : undefined,
        });
        expect(response.status).toBe(404);
      }

      const stillThere = await app.request(`/api/records/${created.id}`, { headers: credentialed(owner.cookie) });
      expect(stillThere.status).toBe(200);
      expect(recordDetailSchema.parse(await stillThere.json()).title).toBe("Private");
    });
  });

  it("FRM-1 rejects a closed record without a reason", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("form"), password, name: "Form" });
      const rejected = await app.request("/api/records", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ title: "Done", status: "closed", summary: "", body: "", reason: "  " }),
      });
      expect(rejected.status).toBe(400);
      expect(errorBodySchema.parse(await rejected.json()).error.code).toBe("validation");

      const created = await createRecord(app, owner.cookie, {
        title: "Open item",
        status: "open",
        summary: "Short",
        body: "Longer body",
      });
      expect(created.status).toBe("open");
      expect(created.reason).toBeNull();
    });
  });

  it("CFM-1 deletes only the caller's confirmed records", async () => {
    await withApp(async ({ app, db }) => {
      const owner = await signUp(app, { email: uniqueEmail("cfm"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("cfm-other"), password, name: "Other" });
      const first = await createRecord(app, owner.cookie, { title: "One", status: "open" });
      const second = await createRecord(app, owner.cookie, { title: "Two", status: "open" });
      const third = await createRecord(app, owner.cookie, { title: "Three", status: "open" });
      const foreign = await createRecord(app, other.cookie, { title: "Foreign", status: "open" });

      const single = await app.request(`/api/records/${first.id}`, {
        method: "DELETE",
        headers: credentialed(owner.cookie),
      });
      expect(single.status).toBe(204);
      expect((await app.request(`/api/records/${first.id}`, { headers: credentialed(owner.cookie) })).status).toBe(404);

      const ownedSet = await app.request("/api/records/bulk-delete", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify(bulkDeleteRecordsSchema.parse({ ids: [second.id, third.id] })),
      });
      expect(ownedSet.status).toBe(204);

      const kept = await createRecord(app, owner.cookie, { title: "Kept", status: "open" });
      const mixed = await app.request("/api/records/bulk-delete", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ ids: [kept.id, foreign.id] }),
      });
      expect(mixed.status).toBe(404);
      expect(errorBodySchema.parse(await mixed.json()).error.message).toMatch(/not applied/i);
      const stillKept = await app.request(`/api/records/${kept.id}`, { headers: credentialed(owner.cookie) });
      expect(stillKept.status).toBe(200);
      const foreignStill = await app.request(`/api/records/${foreign.id}`, { headers: credentialed(other.cookie) });
      expect(foreignStill.status).toBe(200);

      const missing = await app.request("/api/records/bulk-delete", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ ids: [kept.id, "00000000-0000-4000-8000-000000000000"] }),
      });
      expect(missing.status).toBe(404);
      expect((await app.request(`/api/records/${kept.id}`, { headers: credentialed(owner.cookie) })).status).toBe(200);

      await db
        .insert(recordPermission)
        .values({ userId: owner.userId, canView: true, canDelete: false })
        .onConflictDoUpdate({
          target: recordPermission.userId,
          set: { canView: true, canDelete: false },
        });
      const forbidden = await app.request("/api/records/bulk-delete", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ ids: [kept.id] }),
      });
      expect(forbidden.status).toBe(403);
      expect(errorBodySchema.parse(await forbidden.json()).error.code).toBe("forbidden");
      expect((await app.request(`/api/records/${kept.id}`, { headers: credentialed(owner.cookie) })).status).toBe(200);
    });
  });
});

function uniqueEmail(label: string): string {
  return `${label}-${crypto.randomUUID()}@example.com`;
}

async function withApp(
  run: (app: Awaited<ReturnType<typeof createTestApp>>) => Promise<void>,
) {
  await withDisposableDatabase(true, async (databaseUrl) => {
    const testApp = await createTestApp(databaseUrl);
    try {
      await run(testApp);
    } finally {
      await testApp.close();
    }
  });
}

async function createRecord(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  input: { title: string; status: "open" | "closed"; summary?: string; body?: string; reason?: string },
) {
  const response = await app.request("/api/records", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({
      title: input.title,
      status: input.status,
      summary: input.summary ?? "",
      body: input.body ?? "",
      ...(input.reason ? { reason: input.reason } : {}),
    }),
  });
  expect(response.status).toBe(201);
  return recordSchema.parse(await response.json());
}
