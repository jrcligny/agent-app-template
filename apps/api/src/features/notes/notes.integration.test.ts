import { errorBodySchema, noteListSchema, noteSchema, sessionUserSchema } from "@agent-app/contracts";
import { describe, expect, it } from "vitest";
import { credentialed, createTestApp, signUp } from "../../test/http.js";
import { withDisposableDatabase } from "../../test/database.js";

const password = "correct-horse-1";

describe("notes and sessions", () => {
  it("AUTH-1 rejects notes without a session", async () => {
    await withApp(async ({ app }) => {
      const response = await app.request("/api/notes");
      expect(response.status).toBe(401);
      expect(errorBodySchema.parse(await response.json()).error.code).toBe("unauthorized");
    });
  });

  it("AUTH-2 returns the account summary without a password or token", async () => {
    await withApp(async ({ app }) => {
      const account = await signUp(app, {
        email: uniqueEmail("me"),
        password,
        name: "Ada",
      });
      const response = await app.request("/api/me", { headers: credentialed(account.cookie) });
      expect(response.status).toBe(200);
      const body = sessionUserSchema.parse(await response.json());
      expect(body).toEqual({ id: expect.any(String), email: expect.stringContaining("@"), name: "Ada" });
      expect(JSON.stringify(body).toLowerCase()).not.toContain("password");
      expect(JSON.stringify(body).toLowerCase()).not.toContain("token");
    });
  });

  it("AUTH-3 sets an HttpOnly session cookie and rejects an untrusted or missing origin", async () => {
    await withApp(async ({ app }) => {
      const account = await signUp(app, {
        email: uniqueEmail("cookie"),
        password,
        name: "Cookie",
      });
      const joined = account.setCookie.join("\n");
      expect(joined.toLowerCase()).toContain("httponly");
      expect(joined.toLowerCase()).not.toContain("samesite=none");

      const rejected = await app.request("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://evil.example" },
        body: JSON.stringify({ email: uniqueEmail("evil"), password, name: "Evil" }),
      });
      expect(rejected.status).toBeGreaterThanOrEqual(400);

      const missingOrigin = await app.request("/api/notes", {
        method: "POST",
        headers: { cookie: account.cookie, "content-type": "application/json" },
        body: JSON.stringify({ title: "No origin", body: "blocked" }),
      });
      expect(missingOrigin.status).toBe(403);
    });
  });

  it("AUTH-4 rejects notes after sign-out", async () => {
    await withApp(async ({ app }) => {
      const account = await signUp(app, {
        email: uniqueEmail("out"),
        password,
        name: "Out",
      });
      const signedOut = await app.request("/api/auth/sign-out", {
        method: "POST",
        headers: credentialed(account.cookie),
      });
      expect(signedOut.status).toBeLessThan(400);
      const notes = await app.request("/api/notes", { headers: credentialed(account.cookie) });
      expect(notes.status).toBe(401);
    });
  });

  it("NOTES-1 creates a note and lists only that account's notes", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("owner"), password, name: "Owner" });
      const other = await signUp(app, { email: uniqueEmail("other"), password, name: "Other" });
      const created = await app.request("/api/notes", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ title: "Milk", body: "Oat" }),
      });
      expect(created.status).toBe(201);
      const note = noteSchema.parse(await created.json());
      expect(note.title).toBe("Milk");

      await new Promise((resolve) => setTimeout(resolve, 20));
      await app.request("/api/notes", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ title: "Bread", body: "Rye" }),
      });

      const listed = await app.request("/api/notes", { headers: credentialed(owner.cookie) });
      const ownerNotes = noteListSchema.parse(await listed.json());
      expect(ownerNotes.notes.map((item) => item.title)).toEqual(["Bread", "Milk"]);

      const otherList = await app.request("/api/notes", { headers: credentialed(other.cookie) });
      expect(noteListSchema.parse(await otherList.json()).notes).toEqual([]);
    });
  });

  it("NOTES-2 does not reveal another account's note", async () => {
    await withApp(async ({ app }) => {
      const owner = await signUp(app, { email: uniqueEmail("a"), password, name: "A" });
      const intruder = await signUp(app, { email: uniqueEmail("b"), password, name: "B" });
      const created = await app.request("/api/notes", {
        method: "POST",
        headers: { ...credentialed(owner.cookie), "content-type": "application/json" },
        body: JSON.stringify({ title: "Private", body: "Secret" }),
      });
      const note = noteSchema.parse(await created.json());

      for (const method of ["GET", "PATCH", "DELETE"] as const) {
        const response = await app.request(`/api/notes/${note.id}`, {
          method,
          headers: {
            ...credentialed(intruder.cookie),
            ...(method === "PATCH" ? { "content-type": "application/json" } : {}),
          },
          body: method === "PATCH" ? JSON.stringify({ title: "Stolen" }) : undefined,
        });
        expect(response.status).toBe(404);
      }

      const stillThere = await app.request(`/api/notes/${note.id}`, {
        headers: credentialed(owner.cookie),
      });
      expect(stillThere.status).toBe(200);
      expect(noteSchema.parse(await stillThere.json()).title).toBe("Private");
    });
  });

  it("NOTES-3 rejects an empty title", async () => {
    await withApp(async ({ app }) => {
      const account = await signUp(app, { email: uniqueEmail("valid"), password, name: "Val" });
      const response = await app.request("/api/notes", {
        method: "POST",
        headers: { ...credentialed(account.cookie), "content-type": "application/json" },
        body: JSON.stringify({ title: "   ", body: "Nope" }),
      });
      expect(response.status).toBe(400);
      expect(errorBodySchema.parse(await response.json()).error.code).toBe("validation");
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
