import { coverageSchema, draftCollectionSchema, draftMemberSchema, snapshotListSchema, snapshotSchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import { z } from "zod";
import { AccessDeniedError } from "../../access/record-access.js";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";
import {
  SnapshotNotFoundError,
  SnapshotValidationError,
  listDraftCollections,
  listSnapshots,
  publishSnapshot,
  readCoverage,
  readDraft,
  readSnapshot,
} from "../../snapshots/store.js";

const idSchema = z.string().uuid();

export function registerSnapshotRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/collections", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    try {
      const collections = await listDraftCollections(db, user.id);
      return c.json({ collections: collections.map((item) => draftCollectionSchema.parse(item)) });
    } catch (error) {
      return mapSnapshotError(c, error);
    }
  });

  app.get("/api/collections/:id/draft", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = idSchema.safeParse(c.req.param("id"));
    if (!id.success) return errorJson(c, 404, "not_found", "Collection not found");
    try {
      const draft = await readDraft(db, user.id, id.data);
      return c.json({
        id: draft.id,
        name: draft.name,
        members: draft.members.map((member) => draftMemberSchema.parse(member)),
      });
    } catch (error) {
      return mapSnapshotError(c, error);
    }
  });

  app.post("/api/snapshots", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z
      .object({
        collectionId: z.string().uuid(),
        name: z.string().trim().min(1).max(80),
        target: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
        submitKey: z.string().uuid().optional(),
        recordIds: z.array(z.string().uuid()).max(100).optional(),
        environmentName: z.string().trim().max(80).nullable().optional(),
        configDigest: z.string().trim().max(120).nullable().optional(),
        codeVersion: z.string().trim().max(80).nullable().optional(),
      })
      .safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Enter a publish name.");
    try {
      const published = await publishSnapshot(db, user.id, parsed.data);
      return c.json(snapshotSchema.parse(published), 201);
    } catch (error) {
      return mapSnapshotError(c, error);
    }
  });

  app.get("/api/snapshots", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const collectionId = c.req.query("collectionId");
    const parsed = collectionId ? z.string().uuid().safeParse(collectionId) : null;
    if (parsed && !parsed.success) return errorJson(c, 400, "validation", "Choose a collection.");
    try {
      const snapshots = await listSnapshots(db, user.id, parsed?.data);
      return c.json(snapshotListSchema.parse({ snapshots }));
    } catch (error) {
      return mapSnapshotError(c, error);
    }
  });

  app.get("/api/snapshots/:id/coverage", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = idSchema.safeParse(c.req.param("id"));
    if (!id.success) return errorJson(c, 404, "not_found", "Not found");
    try {
      return c.json(coverageSchema.parse(await readCoverage(db, user.id, id.data)));
    } catch (error) {
      return mapSnapshotError(c, error);
    }
  });

  app.get("/api/snapshots/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = idSchema.safeParse(c.req.param("id"));
    if (!id.success) return errorJson(c, 404, "not_found", "Not found");
    try {
      return c.json(snapshotSchema.parse(await readSnapshot(db, user.id, id.data)));
    } catch (error) {
      return mapSnapshotError(c, error);
    }
  });
}

function mapSnapshotError(c: Context, error: unknown): Response {
  if (error instanceof AccessDeniedError) return errorJson(c, 403, "forbidden", error.message);
  if (error instanceof SnapshotNotFoundError) return errorJson(c, 404, "not_found", error.message);
  if (error instanceof SnapshotValidationError) return errorJson(c, 400, "validation", error.message);
  throw error;
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}
