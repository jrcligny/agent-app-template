import { hierarchyAttemptSchema, hierarchySchema, recordSchema } from "@agent-app/contracts";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Db } from "../../db/types.js";
import { recordPermission, snapshotAttempt } from "../../db/schema.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("hierarchy", () => {
  it("NAV-1 omits attempts that were not stored and hides another account", async () => {
    await withDisposableDatabase(true, async (databaseUrl) => {
      const testApp = await createTestApp(databaseUrl);
      try {
        const owner = await signUp(testApp.app, { email: `path-${crypto.randomUUID()}@example.com`, password, name: "Owner" });
        const other = await signUp(testApp.app, { email: `path-other-${crypto.randomUUID()}@example.com`, password, name: "Other" });
        const alpha = await createRecord(testApp.app, owner.cookie, "Alpha title");
        const foreign = await createRecord(testApp.app, other.cookie, "Foreign title");
        const foreignDraft = await createCollection(testApp.app, other.cookie, "Other release");
        await include(testApp.app, other.cookie, foreignDraft.id, [foreign.id]);
        const foreignSnapshot = await publish(testApp.app, other.cookie, foreignDraft.id, "Foreign baseline");
        const draft = await createCollection(testApp.app, owner.cookie, "Release");
        await include(testApp.app, owner.cookie, draft.id, [alpha.id]);
        const published = await publish(testApp.app, owner.cookie, draft.id, "Baseline");

        const opened = await testApp.app.request(
          `/api/hierarchy?collectionId=${draft.id}&snapshotId=${published.id}&itemId=${alpha.id}`,
          { headers: credentialed(owner.cookie) },
        );
        expect(opened.status).toBe(200);
        const path = hierarchySchema.parse(await opened.json());
        expect(path.item?.title).toBe("Alpha title");
        expect(path.item?.attempts).toEqual([]);
        expect(path.attempt).toBeNull();

        const renamed = await testApp.app.request(`/api/records/${alpha.id}`, {
          method: "PATCH",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ title: "Alpha renamed", status: "open", summary: "", body: "" }),
        });
        expect(renamed.status).toBe(200);
        const frozen = await testApp.app.request(
          `/api/hierarchy?collectionId=${draft.id}&snapshotId=${published.id}&itemId=${alpha.id}`,
          { headers: credentialed(owner.cookie) },
        );
        expect(hierarchySchema.parse(await frozen.json()).item?.title).toBe("Alpha title");

        const hidden = await testApp.app.request(
          `/api/hierarchy?collectionId=${draft.id}&snapshotId=${foreignSnapshot.id}`,
          { headers: credentialed(owner.cookie) },
        );
        expect(hidden.status).toBe(404);
        const hiddenBody = JSON.stringify(await hidden.json());
        expect(hiddenBody).not.toContain("Alpha title");
        expect(hiddenBody).not.toContain("Foreign baseline");
        expect(hiddenBody).not.toContain("Release");

        await testApp.db.insert(recordPermission).values({ userId: owner.userId, canView: false, canDelete: false, canCurate: false });
        const denied = await testApp.app.request(
          `/api/hierarchy?collectionId=${draft.id}&snapshotId=${published.id}&itemId=${alpha.id}`,
          { headers: credentialed(owner.cookie) },
        );
        expect(denied.status).toBe(403);
        expect(JSON.stringify(await denied.json())).not.toContain("Alpha title");
      } finally {
        await testApp.close();
      }
    });
  });

  it("NAV-3 rejects an attempt with an empty label", async () => {
    await withDisposableDatabase(true, async (databaseUrl) => {
      const testApp = await createTestApp(databaseUrl);
      try {
        const owner = await signUp(testApp.app, { email: `attempt-${crypto.randomUUID()}@example.com`, password, name: "Owner" });
        const alpha = await createRecord(testApp.app, owner.cookie, "Alpha title");
        const draft = await createCollection(testApp.app, owner.cookie, "Release");
        await include(testApp.app, owner.cookie, draft.id, [alpha.id]);
        const published = await publish(testApp.app, owner.cookie, draft.id, "Baseline");

        const blank = await testApp.app.request("/api/hierarchy/attempts", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ snapshotId: published.id, itemId: alpha.id, label: "   " }),
        });
        expect(blank.status).toBe(400);
        expect(await countAttempts(testApp.db, owner.userId)).toBe(0);

        const stored = await testApp.app.request("/api/hierarchy/attempts", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ snapshotId: published.id, itemId: alpha.id, label: "First check", attemptedAt: "2026-01-15T23:30:00.000Z" }),
        });
        expect(stored.status).toBe(201);
        expect(hierarchyAttemptSchema.parse(await stored.json()).label).toBe("First check");
        expect(await countAttempts(testApp.db, owner.userId)).toBe(1);

        const empty = await testApp.app.request("/api/hierarchy/attempts", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ snapshotId: published.id, itemId: alpha.id, label: "" }),
        });
        expect(empty.status).toBe(400);
        expect(await countAttempts(testApp.db, owner.userId)).toBe(1);

        const read = await testApp.app.request(
          `/api/hierarchy?collectionId=${draft.id}&snapshotId=${published.id}&itemId=${alpha.id}`,
          { headers: credentialed(owner.cookie) },
        );
        expect(hierarchySchema.parse(await read.json()).item?.attempts.map((row) => row.label)).toEqual(["First check"]);
      } finally {
        await testApp.close();
      }
    });
  });
});

async function countAttempts(db: Db, userId: string) {
  const rows = await db.select().from(snapshotAttempt).where(eq(snapshotAttempt.userId, userId));
  return rows.length;
}

async function createRecord(app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> }, cookie: string, title: string) {
  const response = await app.request("/api/records", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ title, status: "open", summary: "", body: "" }),
  });
  expect(response.status).toBe(201);
  return recordSchema.parse(await response.json());
}

async function createCollection(app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> }, cookie: string, name: string) {
  const response = await app.request("/api/collections", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as { id: string };
}

async function include(app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> }, cookie: string, collectionId: string, ids: string[]) {
  const response = await app.request(`/api/collections/${collectionId}/membership`, {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ action: "include", ids, rationale: "Selected for the snapshot." }),
  });
  expect(response.status).toBe(204);
}

async function publish(app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> }, cookie: string, collectionId: string, name: string) {
  const response = await app.request("/api/snapshots", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ collectionId, name }),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as { id: string };
}
