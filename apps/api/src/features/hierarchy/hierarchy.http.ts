import { hierarchyAttemptSchema, hierarchySchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import { z } from "zod";
import { AccessDeniedError } from "../../access/record-access.js";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import type { Db } from "../../db/types.js";
import { HierarchyNotFoundError, HierarchyValidationError, readHierarchy, storeAttempt } from "../../hierarchy/path.js";
import { errorJson } from "../../http/errors.js";

const uuid = z.string().uuid();

export function registerHierarchyRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/hierarchy", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z
      .object({
        collectionId: uuid,
        snapshotId: uuid.optional(),
        itemId: uuid.optional(),
        attemptId: uuid.optional(),
        status: z.enum(["open", "closed"]).optional(),
      })
      .safeParse({
        collectionId: c.req.query("collectionId"),
        snapshotId: c.req.query("snapshotId") || undefined,
        itemId: c.req.query("itemId") || undefined,
        attemptId: c.req.query("attemptId") || undefined,
        status: c.req.query("status") || undefined,
      });
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose a collection.");
    try {
      const path = await readHierarchy(db, user.id, {
        collectionId: parsed.data.collectionId,
        snapshotId: parsed.data.snapshotId ?? null,
        itemId: parsed.data.itemId ?? null,
        attemptId: parsed.data.attemptId ?? null,
        status: parsed.data.status ?? "",
      });
      return c.json(hierarchySchema.parse(path));
    } catch (error) {
      return mapError(c, error);
    }
  });

  app.post("/api/hierarchy/attempts", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = z
      .object({
        snapshotId: uuid,
        itemId: uuid,
        label: z.string().trim().min(1).max(80),
        attemptedAt: z.string().datetime().optional(),
      })
      .safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Enter an attempt label.");
    try {
      const stored = await storeAttempt(db, user.id, {
        snapshotId: parsed.data.snapshotId,
        itemId: parsed.data.itemId,
        label: parsed.data.label,
        ...(parsed.data.attemptedAt ? { attemptedAt: new Date(parsed.data.attemptedAt) } : {}),
      });
      return c.json(hierarchyAttemptSchema.parse(stored), 201);
    } catch (error) {
      return mapError(c, error);
    }
  });
}

function mapError(c: Context, error: unknown): Response {
  if (error instanceof AccessDeniedError) return errorJson(c, 403, "forbidden", error.message);
  if (error instanceof HierarchyNotFoundError) return errorJson(c, 404, "not_found", error.message);
  if (error instanceof HierarchyValidationError) return errorJson(c, 400, "validation", error.message);
  throw error;
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}
