import { errorBodySchema, recordSchema } from "@agent-app/contracts";
import { describe, expect, it } from "vitest";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("collection membership", () => {
  it("MEM-1 lists one record in two collections", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("mem"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("mem-other"), password, name: "Other" });
      const owned = await createRecord(app, owner.cookie, "Shared");
      const foreign = await createRecord(app, other.cookie, "Hidden");
      const first = await createCollection(app, owner.cookie, "Inbox");
      const second = await createCollection(app, owner.cookie, "Review");
      expect(
        (
          await membership(app, owner.cookie, first.id, {
            action: "include",
            ids: [owned.id],
          })
        ).status,
      ).toBe(204);
      expect(
        (
          await membership(app, owner.cookie, second.id, {
            action: "include",
            ids: [owned.id],
          })
        ).status,
      ).toBe(204);
      expect(await recordIds(app, owner.cookie, first.id)).toEqual([owned.id]);
      expect(await recordIds(app, owner.cookie, second.id)).toEqual([owned.id]);
      const sneaky = await membership(app, owner.cookie, first.id, { action: "include", ids: [foreign.id] });
      expect(sneaky.status).toBe(404);
      expect(await recordIds(app, owner.cookie, first.id)).toEqual([owned.id]);
      expect((await app.request(`/api/collections/${first.id}`, { headers: credentialed(other.cookie) })).status).toBe(404);
    });
  });

  it("MEM-2 rolls back the batch when any id is not owned", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("bulk"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("bulk-other"), password, name: "Other" });
      const first = await createRecord(app, owner.cookie, "One");
      const second = await createRecord(app, owner.cookie, "Two");
      const foreign = await createRecord(app, other.cookie, "Foreign");
      const box = await createCollection(app, owner.cookie, "Batch");
      expect(
        (await membership(app, owner.cookie, box.id, { action: "include", ids: [first.id, second.id] })).status,
      ).toBe(204);

      const missingRationale = await membership(app, owner.cookie, box.id, {
        action: "annotate",
        ids: [first.id, second.id],
        rationale: "   ",
      });
      expect(missingRationale.status).toBe(400);
      expect(errorBodySchema.parse(await missingRationale.json()).error.code).toBe("validation");

      const annotated = await membership(app, owner.cookie, box.id, {
        action: "annotate",
        ids: [first.id, second.id],
        rationale: "Reviewed together",
      });
      expect(annotated.status).toBe(204);
      const afterNote = await app.request(`/api/collections/${box.id}`, { headers: credentialed(owner.cookie) });
      const noted = (await afterNote.json()) as { memberships: { id: string; rationale: string | null }[] };
      expect(noted.memberships.every((item) => item.rationale === "Reviewed together")).toBe(true);

      const mixed = await membership(app, owner.cookie, box.id, {
        action: "exclude",
        ids: [first.id, foreign.id],
      });
      expect(mixed.status).toBe(404);
      expect(await recordIds(app, owner.cookie, box.id)).toEqual(expect.arrayContaining([first.id, second.id]));

      const excluded = await membership(app, owner.cookie, box.id, { action: "exclude", ids: [second.id] });
      expect(excluded.status).toBe(204);
      expect(await recordIds(app, owner.cookie, box.id)).toEqual([first.id]);
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

async function membership(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  collectionId: string,
  body: { action: string; ids: string[]; rationale?: string },
) {
  return app.request(`/api/collections/${collectionId}/membership`, {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function recordIds(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  collectionId: string,
) {
  const response = await app.request(`/api/collections/${collectionId}`, { headers: credentialed(cookie) });
  expect(response.status).toBe(200);
  const body = (await response.json()) as { recordIds: string[] };
  return body.recordIds;
}
