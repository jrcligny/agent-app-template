import { errorBodySchema, recordSchema } from "@agent-app/contracts";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { recordArtifact, recordPermission } from "../../db/schema.js";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("evidence", () => {
  it("ART-1 hides another account's artifact and rejects an unsafe link", async () => {
    await withApp(async ({ app, db }) => {
      const owner = await signUp(app, { email: uniqueEmail("art"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("art-other"), password, name: "Other" });
      const record = await createRecord(app, owner.cookie, "With evidence");

      for (const link of ["javascript:alert(1)", "https://evil.example/a", "//evil.example", "data:text/html,hi", "/../../etc/passwd"]) {
        const rejected = await app.request(`/api/records/${record.id}/sections`, {
          method: "POST",
          headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
          body: JSON.stringify({ title: "Context", text: "field", link }),
        });
        expect(rejected.status).toBe(400);
        expect(errorBodySchema.parse(await rejected.json()).error.code).toBe("validation");
      }
      const sections = await app.request(`/api/records/${record.id}/sections`, { headers: credentialed(owner.cookie) });
      expect(((await sections.json()) as { sections: unknown[] }).sections).toEqual([]);

      const safe = await app.request(`/api/records/${record.id}/sections`, {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ title: "Context", text: "<img src=x onerror=alert(1)>", link: "/records" }),
      });
      expect(safe.status).toBe(201);

      const image = await upload(app, owner.cookie, record.id, {
        fileName: "../secret.png",
        mediaType: "image/png",
        contentBase64: png,
      });
      expect(image.fileName).toBe("secret.png");
      expect(image.contentPath).toBe(`/api/artifacts/${image.id}/bytes`);
      expect(JSON.stringify(image).toLowerCase()).not.toMatch(/token|password|secret_key|authorization/);

      const bytes = await app.request(`/api/artifacts/${image.id}/bytes`, { headers: credentialed(owner.cookie) });
      expect(bytes.status).toBe(200);
      expect(bytes.headers.get("x-content-type-options")).toBe("nosniff");
      expect(bytes.headers.get("content-type")).toBe("image/png");
      expect(bytes.headers.get("set-cookie")).toBeNull();

      for (const path of [`/api/artifacts/${image.id}`, `/api/artifacts/${image.id}/bytes`, `/api/records/${record.id}/sections`]) {
        const hidden = await app.request(path, { headers: credentialed(other.cookie) });
        expect(hidden.status).toBe(404);
      }

      await db.update(recordArtifact).set({ contentBase64: null }).where(eq(recordArtifact.id, image.id));
      const unreadable = await app.request(`/api/artifacts/${image.id}/bytes`, { headers: credentialed(owner.cookie) });
      expect(unreadable.status).toBe(500);
      const unreadableBody = JSON.stringify(errorBodySchema.parse(await unreadable.json()));
      expect(unreadableBody).not.toContain("iVBORw0");
      expect(unreadableBody.toLowerCase()).not.toMatch(/token|password/);

      await db.insert(recordPermission).values({ userId: owner.userId, canView: true, canDelete: true, canCurate: false });
      const curated = await app.request(`/api/records/${record.id}/sections`, { headers: credentialed(owner.cookie) });
      expect(curated.status).toBe(200);
      const blockedWrite = await app.request(`/api/records/${record.id}/artifacts`, {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({
          fileName: "log.txt",
          mediaType: "text/plain",
          contentBase64: Buffer.from("nope").toString("base64"),
        }),
      });
      expect(blockedWrite.status).toBe(403);
      await db.delete(recordPermission).where(eq(recordPermission.userId, owner.userId));

      await db.insert(recordPermission).values({ userId: owner.userId, canView: false, canDelete: false, canCurate: false });
      const forbidden = await app.request(`/api/artifacts/${image.id}`, { headers: credentialed(owner.cookie) });
      expect(forbidden.status).toBe(403);

      await db.delete(recordPermission).where(eq(recordPermission.userId, owner.userId));
      const removed = await app.request(`/api/records/${record.id}`, {
        method: "DELETE",
        headers: credentialed(owner.cookie),
      });
      expect(removed.status).toBe(204);
      const afterDelete = await app.request(`/api/artifacts/${image.id}`, { headers: credentialed(owner.cookie) });
      expect(afterDelete.status).toBe(404);
    });
  });

  it("ART-2 keeps the original bytes after a replacement", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("replace"), password, name: "Owner" });
      const record = await createRecord(app, owner.cookie, "Versions");
      const first = await upload(app, owner.cookie, record.id, {
        fileName: "log.txt",
        mediaType: "text/plain",
        contentBase64: Buffer.from("alpha-log").toString("base64"),
      });
      const second = await upload(app, owner.cookie, record.id, {
        fileName: "log.txt",
        mediaType: "text/plain",
        contentBase64: Buffer.from("beta-log-longer").toString("base64"),
      });
      expect(second.id).not.toBe(first.id);
      const oldBytes = await app.request(`/api/artifacts/${first.id}/bytes`, { headers: credentialed(owner.cookie) });
      expect(await oldBytes.text()).toBe("alpha-log");
      expect(first.byteSize).toBe(Buffer.byteLength("alpha-log"));
      const fresh = await app.request(`/api/artifacts/${first.id}`, { headers: credentialed(owner.cookie) });
      expect(((await fresh.json()) as { byteSize: number }).byteSize).toBe(first.byteSize);
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

async function upload(
  app: { request: (input: string, init?: RequestInit) => Response | Promise<Response> },
  cookie: string,
  recordId: string,
  body: { fileName: string; mediaType: string; contentBase64: string },
) {
  const response = await app.request(`/api/records/${recordId}/artifacts`, {
    method: "POST",
    headers: { ...credentialed(cookie), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  expect(response.status).toBe(201);
  return (await response.json()) as { id: string; fileName: string; byteSize: number; contentPath: string };
}
