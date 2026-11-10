import { recordSchema, snapshotDiffSchema } from "@agent-app/contracts";
import { describe, expect, it } from "vitest";
import { observation, recordPermission } from "../../db/schema.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("comparison", () => {
  it("DIFF-1 classifies added, removed, and changed", async () => {
    await withDisposableDatabase(true, async (databaseUrl) => {
      const testApp = await createTestApp(databaseUrl);
      try {
        const owner = await signUp(testApp.app, { email: `diff-${crypto.randomUUID()}@example.com`, password, name: "Owner" });
        const other = await signUp(testApp.app, { email: `diff-other-${crypto.randomUUID()}@example.com`, password, name: "Other" });
        const alpha = await createRecord(testApp.app, owner.cookie, "Alpha title");
        const beta = await createRecord(testApp.app, owner.cookie, "Beta title");
        const gamma = await createRecord(testApp.app, owner.cookie, "Gamma title");
        const foreign = await createRecord(testApp.app, other.cookie, "Foreign title");
        const foreignDraft = await createCollection(testApp.app, other.cookie, "Other release");
        await include(testApp.app, other.cookie, foreignDraft.id, [foreign.id]);
        const foreignSnapshot = await publish(testApp.app, other.cookie, foreignDraft.id, "Other baseline");
        const draft = await createCollection(testApp.app, owner.cookie, "Release");
        await include(testApp.app, owner.cookie, draft.id, [alpha.id, beta.id]);
        const first = await publish(testApp.app, owner.cookie, draft.id, "Baseline");
        await exclude(testApp.app, owner.cookie, draft.id, [alpha.id]);
        await include(testApp.app, owner.cookie, draft.id, [gamma.id]);
        const renamed = await testApp.app.request(`/api/records/${beta.id}`, {
          method: "PATCH",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ title: "Beta renamed", status: "open", summary: "", body: "" }),
        });
        expect(renamed.status).toBe(200);
        const second = await publish(testApp.app, owner.cookie, draft.id, "Later", { codeVersion: "2026.11.10" });
        const compared = await testApp.app.request("/api/comparisons/snapshots", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ baselineId: first.id, laterId: second.id }),
        });
        expect(compared.status).toBe(200);
        const body = snapshotDiffSchema.parse(await compared.json());
        expect(body.rows.find((row) => row.id === alpha.id)?.kind).toBe("removed");
        expect(body.rows.find((row) => row.id === gamma.id)?.kind).toBe("added");
        const changed = body.rows.find((row) => row.id === beta.id);
        expect(changed?.kind).toBe("changed");
        expect(changed?.fields).toEqual(["title"]);
        expect(changed?.leftTitle).toBe("Beta title");
        expect(body.provenance).toEqual([{ field: "codeVersion", left: null, right: "2026.11.10" }]);

        const same = await testApp.app.request("/api/comparisons/snapshots", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ baselineId: first.id, laterId: first.id }),
        });
        expect(snapshotDiffSchema.parse(await same.json()).rows).toEqual([]);

        const hidden = await testApp.app.request("/api/comparisons/snapshots", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ baselineId: first.id, laterId: foreignSnapshot.id }),
        });
        expect(hidden.status).toBe(404);
        expect(JSON.stringify(await hidden.json())).not.toContain("Alpha title");

        await testApp.db.insert(observation).values([
          { userId: owner.userId, recordId: alpha.id, category: "alpha", status: "open", value: 1, observedAt: new Date("2026-01-15T10:00:00.000Z") },
          { userId: owner.userId, recordId: beta.id, category: "beta", status: "open", value: 2, observedAt: new Date("2026-01-16T10:00:00.000Z") },
        ]);
        const windows = await testApp.app.request("/api/comparisons/windows", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({
            leftFrom: "2026-01-15T00:00:00.000Z",
            leftTo: "2026-01-16T00:00:00.000Z",
            rightFrom: "2026-01-16T00:00:00.000Z",
            rightTo: "2026-01-17T00:00:00.000Z",
            timeZone: "Europe/Paris",
            granularity: "day",
          }),
        });
        expect(windows.status).toBe(200);
        const windowBody = (await windows.json()) as { leftCount: number; rightCount: number; rows: { kind: string }[] };
        expect(windowBody.leftCount).toBe(1);
        expect(windowBody.rightCount).toBe(1);
        expect(windowBody.rows.map((row) => row.kind).sort()).toEqual(["added", "removed"]);

        const emptyWindows = await testApp.app.request("/api/comparisons/windows", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({
            leftFrom: "2026-02-01T00:00:00.000Z",
            leftTo: "2026-02-02T00:00:00.000Z",
            rightFrom: "2026-02-02T00:00:00.000Z",
            rightTo: "2026-02-03T00:00:00.000Z",
          }),
        });
        const emptyBody = (await emptyWindows.json()) as { leftCount: number; rows: unknown[] };
        expect(emptyBody.leftCount).toBe(0);
        expect(emptyBody.rows).toEqual([]);

        const unordered = await testApp.app.request("/api/comparisons/windows", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({
            leftFrom: "2026-01-16T00:00:00.000Z",
            leftTo: "2026-01-15T00:00:00.000Z",
            rightFrom: "2026-01-16T00:00:00.000Z",
            rightTo: "2026-01-17T00:00:00.000Z",
          }),
        });
        expect(unordered.status).toBe(400);

        await testApp.db.insert(recordPermission).values({ userId: owner.userId, canView: false, canDelete: false, canCurate: false });
        const denied = await testApp.app.request("/api/comparisons/snapshots", {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ baselineId: first.id, laterId: second.id }),
        });
        expect(denied.status).toBe(403);
        expect(JSON.stringify(await denied.json())).not.toContain("Alpha title");
      } finally {
        await testApp.close();
      }
    });
  });
});

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

async function exclude(app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> }, cookie: string, collectionId: string, ids: string[]) {
  const response = await app.request(`/api/collections/${collectionId}/membership`, {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ action: "exclude", ids }),
  });
  expect(response.status).toBe(204);
}

async function publish(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  collectionId: string,
  name: string,
  extra?: { codeVersion?: string },
) {
  const response = await app.request("/api/snapshots", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ collectionId, name, ...extra }),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as { id: string };
}
