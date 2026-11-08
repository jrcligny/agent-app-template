import type { Context, Hono } from "hono";
import { z } from "zod";
import { AccessDeniedError } from "../../access/record-access.js";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import {
  EvidenceNotFoundError,
  EvidenceUnreadableError,
  addArtifact,
  addSection,
  listArtifacts,
  listSections,
  readArtifact,
} from "../../evidence/store.js";
import { EvidenceValidationError } from "../../evidence/safety.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";

const idSchema = z.string().uuid();

export function registerEvidenceRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/records/:id/sections", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Record not found");
    try {
      return c.json({ sections: await listSections(db, user.id, id) });
    } catch (error) {
      return mapEvidenceError(c, error);
    }
  });

  app.post("/api/records/:id/sections", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Record not found");
    const parsed = z
      .object({
        title: z.string().trim().min(1).max(80),
        text: z.string().max(10_000),
        parentId: z.string().uuid().optional(),
        link: z.string().max(300).optional(),
      })
      .safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Enter a section title.");
    try {
      return c.json(await addSection(db, user.id, id, parsed.data), 201);
    } catch (error) {
      return mapEvidenceError(c, error);
    }
  });

  app.get("/api/records/:id/artifacts", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Record not found");
    try {
      return c.json({ artifacts: await listArtifacts(db, user.id, id) });
    } catch (error) {
      return mapEvidenceError(c, error);
    }
  });

  app.post("/api/records/:id/artifacts", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Record not found");
    const parsed = z
      .object({
        fileName: z.string().min(1).max(120),
        mediaType: z.string().min(1).max(80),
        contentBase64: z.string().min(1).max(400_000),
      })
      .safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose a small plain-text log or a PNG or JPEG image.");
    try {
      return c.json(await addArtifact(db, user.id, id, parsed.data), 201);
    } catch (error) {
      return mapEvidenceError(c, error);
    }
  });

  app.get("/api/artifacts/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Not found");
    try {
      const artifact = await readArtifact(db, user.id, id);
      return c.json(artifact.metadata);
    } catch (error) {
      return mapEvidenceError(c, error);
    }
  });

  app.get("/api/artifacts/:id/bytes", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Not found");
    try {
      const artifact = await readArtifact(db, user.id, id);
      return new Response(Buffer.from(artifact.bytes), {
        status: 200,
        headers: {
          "content-type": artifact.metadata.mediaType,
          "x-content-type-options": "nosniff",
          "content-disposition": `inline; filename="${artifact.metadata.fileName.replaceAll('"', "")}"`,
          "cache-control": "private, no-store",
        },
      });
    } catch (error) {
      return mapEvidenceError(c, error);
    }
  });
}

function parseId(value: string): string | undefined {
  const parsed = idSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function mapEvidenceError(c: Context, error: unknown): Response {
  if (error instanceof AccessDeniedError) return errorJson(c, 403, "forbidden", error.message);
  if (error instanceof EvidenceNotFoundError) return errorJson(c, 404, "not_found", error.message);
  if (error instanceof EvidenceValidationError) return errorJson(c, 400, "validation", error.message);
  if (error instanceof EvidenceUnreadableError) return errorJson(c, 500, "internal", error.message);
  throw error;
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}
