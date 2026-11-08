import { coverageSchema, recordSchema } from "@agent-app/contracts";
import { describe, expect, it } from "vitest";
import { observation } from "../../db/schema.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("coverage", () => {
  it("COV-1 lists a missing category only when a target includes it", async () => {
    await withDisposableDatabase(true, async (databaseUrl) => {
      const testApp = await createTestApp(databaseUrl);
      try {
        const owner = await signUp(testApp.app, { email: `cov-${crypto.randomUUID()}@example.com`, password, name: "Owner" });
        const alpha = await createRecord(testApp.app, owner.cookie, "Alpha one");
        const alphaAgain = await createRecord(testApp.app, owner.cookie, "Alpha two");
        const gamma = await createRecord(testApp.app, owner.cookie, "Gamma one");
        await testApp.db.insert(observation).values([
          { userId: owner.userId, recordId: alpha.id, category: "alpha", status: "open", value: 1, observedAt: new Date("2026-01-02T00:00:00.000Z") },
          { userId: owner.userId, recordId: alphaAgain.id, category: "alpha", status: "open", value: 1, observedAt: new Date("2026-01-02T00:00:00.000Z") },
          { userId: owner.userId, recordId: gamma.id, category: "gamma", status: "open", value: 1, observedAt: new Date("2026-01-02T00:00:00.000Z") },
        ]);
        const draft = await createCollection(testApp.app, owner.cookie, "Coverage");
        const membership = await testApp.app.request(`/api/collections/${draft.id}/membership`, {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ action: "include", ids: [alpha.id, alphaAgain.id, gamma.id], rationale: "Coverage set." }),
        });
        expect(membership.status).toBe(204);
        const targeted = await publish(testApp.app, owner.cookie, draft.id, "Targeted", ["alpha", "beta", "gamma"]);
        const gap = await testApp.app.request(`/api/snapshots/${targeted.id}/coverage`, { headers: credentialed(owner.cookie) });
        const gapBody = coverageSchema.parse(await gap.json());
        expect(gapBody.missing).toEqual(["beta"]);
        expect(gapBody.counts).toEqual([
          { category: "alpha", count: 2 },
          { category: "beta", count: 0 },
          { category: "gamma", count: 1 },
        ]);
        expect(JSON.stringify(gapBody)).not.toMatch(/quality/i);

        const open = await publish(testApp.app, owner.cookie, draft.id, "Open");
        const plain = await testApp.app.request(`/api/snapshots/${open.id}/coverage`, { headers: credentialed(owner.cookie) });
        const plainBody = coverageSchema.parse(await plain.json());
        expect(plainBody.target).toBeNull();
        expect(plainBody.missing).toEqual([]);
        expect(plainBody.counts).toEqual([
          { category: "alpha", count: 2 },
          { category: "gamma", count: 1 },
        ]);
        expect(plainBody.memberCount).toBe(3);
        expect(JSON.stringify(plainBody)).not.toMatch(/quality/i);
      } finally {
        await testApp.close();
      }
    });
  });
});

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

async function publish(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  collectionId: string,
  name: string,
  target?: string[],
) {
  const response = await app.request("/api/snapshots", {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify({ collectionId, name, ...(target ? { target } : {}) }),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as { id: string };
}
