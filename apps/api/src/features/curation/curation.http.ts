import { collectionSchema, membershipChangeSchema, saveViewSchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import { z } from "zod";
import { AccessDeniedError } from "../../access/record-access.js";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import { CurationNotFoundError, applyTag, changeMembership, createCollection, listCollectionRecords, listNamedViews, saveNamedView } from "../../curation/store.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";

const idSchema = z.string().uuid();

export function registerCurationRoutes(app: Hono, db: Db, auth: Auth): void {
  app.post("/api/tags", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z
      .object({
        name: z.string().trim().regex(/^[a-z0-9-]{1,40}$/),
        ids: z.array(z.string().uuid()).min(1).max(100),
      })
      .safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Use a short tag name and at least one record.");
    try {
      await applyTag(db, user.id, parsed.data.name, parsed.data.ids);
      return c.body(null, 204);
    } catch (error) {
      return mapCurationError(c, error);
    }
  });

  app.get("/api/views", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    try {
      return c.json({ views: await listNamedViews(db, user.id) });
    } catch (error) {
      return mapCurationError(c, error);
    }
  });

  app.post("/api/views", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = saveViewSchema.safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Enter a view name.");
    try {
      return c.json(await saveNamedView(db, user.id, parsed.data.name, parsed.data.query), 201);
    } catch (error) {
      return mapCurationError(c, error);
    }
  });

  app.post("/api/collections", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z.object({ name: z.string().trim().min(1).max(80) }).safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Enter a collection name.");
    try {
      return c.json(collectionSchema.parse(await createCollection(db, user.id, parsed.data.name)), 201);
    } catch (error) {
      return mapCurationError(c, error);
    }
  });

  app.get("/api/collections/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = idSchema.safeParse(c.req.param("id"));
    if (!id.success) return errorJson(c, 404, "not_found", "Collection not found");
    try {
      const memberships = await listCollectionRecords(db, user.id, id.data);
      return c.json({ recordIds: memberships.map((item) => item.id), memberships });
    } catch (error) {
      return mapCurationError(c, error);
    }
  });

  app.post("/api/collections/:id/membership", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = idSchema.safeParse(c.req.param("id"));
    if (!id.success) return errorJson(c, 404, "not_found", "Collection not found");
    const parsed = membershipChangeSchema.safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose records for one membership change.");
    if (parsed.data.action === "annotate" && !parsed.data.rationale?.trim()) {
      return errorJson(c, 400, "validation", "Enter a rationale.");
    }
    try {
      await changeMembership(db, user.id, id.data, parsed.data.action, parsed.data.ids, parsed.data.rationale);
      return c.body(null, 204);
    } catch (error) {
      return mapCurationError(c, error);
    }
  });
}

function mapCurationError(c: Context, error: unknown): Response {
  if (error instanceof AccessDeniedError) return errorJson(c, 403, "forbidden", error.message);
  if (error instanceof CurationNotFoundError) return errorJson(c, 404, "not_found", error.message);
  throw error;
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}
