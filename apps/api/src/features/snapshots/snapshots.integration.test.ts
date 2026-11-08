import { recordSchema } from "@agent-app/contracts";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { collection, observation, recordPermission, snapshot, snapshotMember } from "../../db/schema.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("snapshots", () => {
  it("SNP-1 keeps published titles after the source records change", async () => {
    await withApp(async ({ app, db }) => {
      const owner = await signUp(app, { email: uniqueEmail("snap"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("snap-other"), password, name: "Other" });
      const first = await createRecord(app, owner.cookie, "Alpha title");
      const second = await createRecord(app, owner.cookie, "Beta title");
      const foreign = await createRecord(app, other.cookie, "Foreign");
      const draft = await createCollection(app, owner.cookie, "Release");
      await include(app, owner.cookie, draft.id, [first.id, second.id]);
      await db.insert(observation).values([
        { userId: owner.userId, recordId: first.id, category: "alpha", status: "open", value: 1, observedAt: new Date("2026-01-01T00:00:00.000Z") },
        { userId: owner.userId, recordId: second.id, category: "gamma", status: "open", value: 1, observedAt: new Date("2026-01-01T00:00:00.000Z") },
      ]);

      const submitKey = crypto.randomUUID();
      const published = await publish(app, owner.cookie, { collectionId: draft.id, name: "Monday", submitKey });
      expect(published.members.map((member) => member.recordId).sort()).toEqual([first.id, second.id].sort());
      expect(published.members.map((member) => member.title).sort()).toEqual(["Alpha title", "Beta title"]);
      const replay = await publish(app, owner.cookie, { collectionId: draft.id, name: "Monday", submitKey });
      expect(replay.id).toBe(published.id);

      const renamed = await app.request(`/api/records/${first.id}`, {
        method: "PATCH",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ title: "Renamed", status: "open", summary: "", body: "" }),
      });
      expect(renamed.status).toBe(200);
      const removed = await app.request(`/api/records/${second.id}`, { method: "DELETE", headers: credentialed(owner.cookie) });
      expect(removed.status).toBe(204);
      const stored = await app.request(`/api/snapshots/${published.id}`, { headers: credentialed(owner.cookie) });
      expect(stored.status).toBe(200);
      const body = (await stored.json()) as { members: { recordId: string; title: string }[] };
      expect(body.members.map((member) => member.title).sort()).toEqual(["Alpha title", "Beta title"]);
      expect(body.members.map((member) => member.recordId).sort()).toEqual([first.id, second.id].sort());
      const copied = await db.select().from(snapshotMember).where(eq(snapshotMember.snapshotId, published.id));
      expect(copied).toHaveLength(2);

      const emptyDraft = await createCollection(app, owner.cookie, "Empty");
      const empty = await publish(app, owner.cookie, { collectionId: emptyDraft.id, name: "Empty publish" });
      expect(empty.members).toEqual([]);

      const beforeDenied = await db.select().from(snapshot).where(eq(snapshot.userId, owner.userId));
      await db.insert(recordPermission).values({ userId: owner.userId, canView: true, canDelete: true, canCurate: false });
      const denied = await publish(app, owner.cookie, { collectionId: draft.id, name: "Blocked" });
      expect(denied.status).toBe(403);
      const afterDenied = await db.select().from(snapshot).where(eq(snapshot.userId, owner.userId));
      expect(afterDenied).toHaveLength(beforeDenied.length);
      await db.delete(recordPermission).where(eq(recordPermission.userId, owner.userId));

      const mixed = await publish(app, owner.cookie, {
        collectionId: draft.id,
        name: "Mixed",
        recordIds: [first.id, foreign.id],
      });
      expect(mixed.status).toBe(404);
      const hidden = await app.request(`/api/snapshots/${published.id}`, { headers: credentialed(other.cookie) });
      expect(hidden.status).toBe(404);

      await db.insert(recordPermission).values({ userId: owner.userId, canView: false, canDelete: false, canCurate: false });
      const forbiddenRead = await app.request(`/api/snapshots/${published.id}`, { headers: credentialed(owner.cookie) });
      expect(forbiddenRead.status).toBe(403);
      await db.delete(recordPermission).where(eq(recordPermission.userId, owner.userId));

      const [left, right] = await Promise.all([
        publish(app, owner.cookie, { collectionId: emptyDraft.id, name: "Left" }),
        publish(app, owner.cookie, { collectionId: emptyDraft.id, name: "Right" }),
      ]);
      expect(left.id).not.toBe(right.id);
      expect(new Set([left.revision, right.revision]).size).toBe(2);

      await db.delete(collection).where(eq(collection.id, draft.id));
      const afterCollection = await app.request(`/api/snapshots/${published.id}`, { headers: credentialed(owner.cookie) });
      expect(afterCollection.status).toBe(200);
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

async function createCollection(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  name: string,
) {
  const response = await app.request("/api/collections", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as { id: string };
}

async function include(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  collectionId: string,
  ids: string[],
) {
  const response = await app.request(`/api/collections/${collectionId}/membership`, {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ action: "include", ids, rationale: "Publish these records." }),
  });
  expect(response.status).toBe(204);
}

async function publish(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  body: { collectionId: string; name: string; submitKey?: string; recordIds?: string[]; target?: string[] },
) {
  const response = await app.request("/api/snapshots", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status !== 201) return { status: response.status, id: "", revision: 0, members: [] as { recordId: string; title: string }[] };
  const json = (await response.json()) as { id: string; revision: number; members: { recordId: string; title: string }[] };
  return { status: 201, ...json };
}
