import { noteSchema, type CreateNoteInput, type Note, type UpdateNoteInput } from "@agent-app/contracts";
import { and, desc, eq } from "drizzle-orm";
import { note } from "../../db/schema.js";
import type { Db } from "../../db/types.js";

export class NoteNotFoundError extends Error {
  constructor() {
    super("Note not found");
    this.name = "NoteNotFoundError";
  }
}

export async function listNotes(db: Db, userId: string): Promise<Note[]> {
  const rows = await db
    .select()
    .from(note)
    .where(eq(note.userId, userId))
    .orderBy(desc(note.createdAt), desc(note.id));
  return rows.map(toNote);
}

export async function createNote(db: Db, userId: string, input: CreateNoteInput): Promise<Note> {
  const now = new Date();
  const rows = await db
    .insert(note)
    .values({
      userId,
      title: input.title,
      body: input.body,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  const created = rows[0];
  if (!created) {
    throw new Error("Insert did not return a note");
  }
  return toNote(created);
}

export async function getNote(db: Db, userId: string, id: string): Promise<Note> {
  const rows = await db
    .select()
    .from(note)
    .where(and(eq(note.id, id), eq(note.userId, userId)))
    .limit(1);
  const row = rows[0];
  if (!row) {
    throw new NoteNotFoundError();
  }
  return toNote(row);
}

export async function updateNote(
  db: Db,
  userId: string,
  id: string,
  input: UpdateNoteInput,
): Promise<Note> {
  const rows = await db
    .update(note)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(note.id, id), eq(note.userId, userId)))
    .returning();
  const row = rows[0];
  if (!row) {
    throw new NoteNotFoundError();
  }
  return toNote(row);
}

export async function deleteNote(db: Db, userId: string, id: string): Promise<void> {
  const rows = await db
    .delete(note)
    .where(and(eq(note.id, id), eq(note.userId, userId)))
    .returning({ id: note.id });
  if (!rows[0]) {
    throw new NoteNotFoundError();
  }
}

function toNote(row: {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): Note {
  return noteSchema.parse({
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
