import {
  recordSchema,
  type RecordCounts,
  type RecordDetail,
  type RecordPage,
  type RecordWrite,
  type WorkbenchRecord,
} from "@agent-app/contracts";
import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { requireRecordDelete, requireRecordView } from "../../access/record-access.js";
import { appendEvent } from "../../activity/events.js";
import { record, user } from "../../db/schema.js";
import type { Db } from "../../db/types.js";

export class RecordNotFoundError extends Error {
  constructor(message = "Record not found") {
    super(message);
    this.name = "RecordNotFoundError";
  }
}

export { AccessDeniedError as RecordForbiddenError } from "../../access/record-access.js";

export type RecordListQuery = {
  q?: string;
  status?: "open" | "closed";
  tag?: string;
  collection?: string;
  category?: string;
  from?: Date;
  to?: Date;
  sort: "title" | "-title";
  page: number;
  pageSize: number;
};

export async function countRecords(db: Db, userId: string): Promise<RecordCounts> {
  await requireRecordView(db, userId);
  const owned = eq(record.userId, userId);
  const allRows = await db.select({ value: count() }).from(record).where(owned);
  const openRows = await db
    .select({ value: count() })
    .from(record)
    .where(and(owned, eq(record.status, "open")));
  return {
    all: Number(allRows[0]?.value ?? 0),
    open: Number(openRows[0]?.value ?? 0),
  };
}

export async function listRecords(db: Db, userId: string, query: RecordListQuery): Promise<RecordPage> {
  const access = await requireRecordView(db, userId);
  const where = filters(userId, query);
  const totalRows = await db.select({ value: count() }).from(record).where(where);
  const rows = await db
    .select(recordColumns())
    .from(record)
    .innerJoin(user, eq(record.userId, user.id))
    .where(where)
    .orderBy(query.sort === "-title" ? desc(record.title) : asc(record.title), asc(record.id))
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize);
  return {
    records: rows.map((row) => toRecord(row)),
    total: Number(totalRows[0]?.value ?? 0),
    page: query.page,
    pageSize: query.pageSize,
    canDelete: access.canDelete,
    canCurate: access.canCurate,
  };
}

export async function createRecord(db: Db, userId: string, input: RecordWrite): Promise<WorkbenchRecord> {
  await requireRecordView(db, userId);
  const now = new Date();
  const inserted = await db
    .insert(record)
    .values({
      userId,
      title: input.title,
      status: input.status,
      summary: input.summary,
      body: input.body,
      reason: input.status === "closed" ? (input.reason ?? null) : null,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: record.id });
  const id = inserted[0]?.id;
  if (!id) throw new Error("Insert did not return a record");
  await appendEvent(db, {
    userId,
    recordId: id,
    kind: "record.created",
    summary: `Created record "${input.title}"`,
    createdAt: now,
  });
  return getOwned(db, userId, id);
}

export async function getRecord(db: Db, userId: string, id: string): Promise<RecordDetail> {
  const access = await requireRecordView(db, userId);
  const found = await getOwned(db, userId, id);
  return { ...found, canDelete: access.canDelete };
}

export async function updateRecord(
  db: Db,
  userId: string,
  id: string,
  input: RecordWrite,
): Promise<WorkbenchRecord> {
  await requireRecordView(db, userId);
  const rows = await db
    .update(record)
    .set({
      title: input.title,
      status: input.status,
      summary: input.summary,
      body: input.body,
      reason: input.status === "closed" ? (input.reason ?? null) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(record.id, id), eq(record.userId, userId)))
    .returning({ id: record.id });
  if (!rows[0]) throw new RecordNotFoundError();
  await appendEvent(db, {
    userId,
    recordId: id,
    kind: "record.updated",
    summary: `Updated record "${input.title}"`,
  });
  return getOwned(db, userId, id);
}

export async function deleteRecords(db: Db, userId: string, ids: readonly string[]): Promise<void> {
  await requireRecordDelete(db, userId);
  const uniqueIds = [...new Set(ids)];
  await db.transaction(async (tx) => {
    const found = await tx
      .select({ id: record.id, title: record.title })
      .from(record)
      .where(and(eq(record.userId, userId), inArray(record.id, uniqueIds)));
    if (found.length !== uniqueIds.length) {
      throw new RecordNotFoundError(
        uniqueIds.length === 1 ? "Record not found" : "That batch was not applied.",
      );
    }
    for (const item of found) {
      await appendEvent(tx, {
        userId,
        recordId: item.id,
        kind: "record.deleted",
        summary: `Deleted record "${item.title}"`,
      });
    }
    await tx.delete(record).where(and(eq(record.userId, userId), inArray(record.id, uniqueIds)));
  });
}

async function getOwned(db: Db, userId: string, id: string): Promise<WorkbenchRecord> {
  const rows = await db
    .select(recordColumns())
    .from(record)
    .innerJoin(user, eq(record.userId, user.id))
    .where(and(eq(record.id, id), eq(record.userId, userId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new RecordNotFoundError();
  return toRecord(row);
}

function filters(userId: string, query: RecordListQuery): SQL | undefined {
  const parts: SQL[] = [eq(record.userId, userId)];
  if (query.status) parts.push(eq(record.status, query.status));
  if (query.q) parts.push(sql`${record.title} ILIKE ${likePattern(query.q)} ESCAPE '\\'`);
  if (query.tag) {
    parts.push(sql`exists (
      select 1 from record_tag
      join tag on tag.id = record_tag.tag_id
      where record_tag.record_id = ${record.id}
        and tag.user_id = ${userId}
        and record_tag.user_id = ${userId}
        and tag.name = ${query.tag}
    )`);
  }
  if (query.collection) {
    parts.push(sql`exists (
      select 1 from membership
      join collection on collection.id = membership.collection_id
      where membership.record_id = ${record.id}
        and membership.user_id = ${userId}
        and collection.user_id = ${userId}
        and collection.id = ${query.collection}::uuid
    )`);
  }
  if (query.from || query.to || query.category) {
    parts.push(sql`exists (
      select 1 from observation
      where observation.user_id = ${userId}
        and observation.record_id = ${record.id}
        and (${query.from ?? null}::timestamptz is null or observation.observed_at >= ${query.from ?? null})
        and (${query.to ?? null}::timestamptz is null or observation.observed_at < ${query.to ?? null})
        and (${query.category ?? null}::text is null or observation.category = ${query.category ?? null})
    )`);
  }
  return and(...parts);
}

function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
}

function recordColumns() {
  return {
    id: record.id,
    title: record.title,
    status: record.status,
    summary: record.summary,
    body: record.body,
    reason: record.reason,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    ownerName: user.name,
  };
}

function toRecord(row: {
  id: string;
  title: string;
  status: string;
  summary: string;
  body: string;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerName: string;
}): WorkbenchRecord {
  return recordSchema.parse({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

