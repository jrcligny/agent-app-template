import { errorBodySchema, recordPageSchema, recordSchema, savedViewSchema } from "@agent-app/contracts";
import { z } from "zod";
import { describe, expect, it } from "vitest";
import { recordPermission } from "../../db/schema.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("saved views", () => {
  it("VIEW-2 stores a named query and rejects an empty name", async () => {
    await withApp(async ({ app, db }) => {
      const owner = await signUp(app, { email: uniqueEmail("view"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("view-other"), password, name: "Other" });
      const record = await createRecord(app, owner.cookie, "Tagged");
      await createRecord(app, other.cookie, "Foreign tagged");
      const tagged = await app.request("/api/tags", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ name: "priority", ids: [record.id] }),
      });
      expect(tagged.status).toBe(204);

      const empty = await app.request("/api/views", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ name: "   ", query: { status: "open", tag: "priority" } }),
      });
      expect(empty.status).toBe(400);

      const saved = await app.request("/api/views", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({
          name: "Open priority",
          query: { status: "open", tag: "priority" },
        }),
      });
      expect(saved.status).toBe(201);
      const view = savedViewSchema.parse(await saved.json());
      expect(view.query).toBe("status=open&tag=priority");
      expect(view.query.startsWith("/")).toBe(false);
      expect(view.query).not.toContain("://");

      const listed = await app.request(`/api/records?${view.query}`, { headers: credentialed(owner.cookie) });
      expect(recordPageSchema.parse(await listed.json()).records.map((item) => item.title)).toEqual(["Tagged"]);

      const hostile = await app.request("/api/views", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ name: "Redirect", query: { tag: "https://evil.example" } }),
      });
      expect(hostile.status).toBe(400);

      await db.insert(recordPermission).values({
        userId: other.userId,
        canView: true,
        canDelete: true,
        canCurate: false,
      });
      const denied = await app.request("/api/views", {
        method: "POST",
        headers: { ...credentialed(other.cookie), "content-type": "application/json" },
        body: JSON.stringify({ name: "Stolen", query: { status: "open" } }),
      });
      expect(denied.status).toBe(403);
      expect(errorBodySchema.parse(await denied.json()).error.code).toBe("forbidden");
      const others = await app.request("/api/views", { headers: credentialed(other.cookie) });
      expect(others.status).toBe(200);
      expect(z.object({ views: z.array(savedViewSchema) }).parse(await others.json()).views).toEqual([]);
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
