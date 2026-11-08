import { activityEventSchema, type ActivityEvent } from "@agent-app/contracts";
import { and, count, desc, eq } from "drizzle-orm";
import { activityEvent } from "../db/schema.js";
import type { Db } from "../db/types.js";

type EventWriter = Pick<Db, "insert">;

export async function appendEvent(
  db: EventWriter,
  input: { userId: string; recordId?: string | null; kind: string; summary: string; createdAt?: Date },
): Promise<void> {
  await db.insert(activityEvent).values({
    userId: input.userId,
    recordId: input.recordId ?? null,
    kind: input.kind,
    summary: input.summary,
    createdAt: input.createdAt ?? new Date(),
  });
}

export async function listEvents(
  db: Db,
  userId: string,
  page: number,
  pageSize: number,
): Promise<{ events: ActivityEvent[]; total: number; page: number; pageSize: number }> {
  const where = eq(activityEvent.userId, userId);
  const totalRows = await db.select({ value: count() }).from(activityEvent).where(where);
  const rows = await db
    .select()
    .from(activityEvent)
    .where(and(where))
    .orderBy(desc(activityEvent.createdAt), desc(activityEvent.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return {
    events: rows.map((row) =>
      activityEventSchema.parse({
        id: row.id,
        kind: row.kind,
        summary: row.summary,
        createdAt: row.createdAt.toISOString(),
      }),
    ),
    total: Number(totalRows[0]?.value ?? 0),
    page,
    pageSize,
  };
}
