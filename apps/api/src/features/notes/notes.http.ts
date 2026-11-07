import { createNoteSchema, updateNoteSchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import { z } from "zod";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";
import {
  NoteNotFoundError,
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from "./notes.service.js";

const noteIdSchema = z.string().uuid();

export function registerNoteRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/notes", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    return c.json({ notes: await listNotes(db, user.id) });
  });

  app.post("/api/notes", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = createNoteSchema.safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Enter a title.");
    return c.json(await createNote(db, user.id, parsed.data), 201);
  });

  app.get("/api/notes/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseNoteId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Note not found");
    try {
      return c.json(await getNote(db, user.id, id));
    } catch (error) {
      return mapNoteError(c, error);
    }
  });

  app.patch("/api/notes/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseNoteId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Note not found");
    const parsed = updateNoteSchema.safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Provide a title or a body to update.");
    try {
      return c.json(await updateNote(db, user.id, id, parsed.data));
    } catch (error) {
      return mapNoteError(c, error);
    }
  });

  app.delete("/api/notes/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseNoteId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Note not found");
    try {
      await deleteNote(db, user.id, id);
      return c.body(null, 204);
    } catch (error) {
      return mapNoteError(c, error);
    }
  });
}

function parseNoteId(value: string): string | undefined {
  const parsed = noteIdSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

function mapNoteError(c: Context, error: unknown): Response {
  if (error instanceof NoteNotFoundError) {
    return errorJson(c, 404, "not_found", "Note not found");
  }
  throw error;
}
