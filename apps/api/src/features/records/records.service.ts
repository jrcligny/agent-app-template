import {
  recordSchema,
  type RecordCounts,
  type RecordDetail,
  type RecordPage,
  type RecordWrite,
  type WorkbenchRecord,
} from "@agent-app/contracts";
import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { record, recordPermission, user } from "../../db/schema.js";
import type { Db } from "../../db/types.js";

export class RecordNotFoundError extends Error {
  constructor(message = "Record not found") {
    super(message);
    this.name = "RecordNotFoundError";
  }
}

export class RecordForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecordForbiddenError";
  }
}

export type RecordListQuery = {
  q?: string;
  status?: "open" | "closed";
  sort: "title" | "-title";
  page: number;
  pageSize: number;
};

export async function countRecords(db: Db, userId: string): Promise<RecordCounts> {
  await requireView(db, userId);
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
  const access = await requireView(db, userId);
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
  };
}

export async function createRecord(db: Db, userId: string, input: RecordWrite): Promise<WorkbenchRecord> {
  await requireView(db, userId);
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
  return getOwned(db, userId, id);
}

export async function getRecord(db: Db, userId: string, id: string): Promise<RecordDetail> {
  const access = await requireView(db, userId);
  const found = await getOwned(db, userId, id);
  return { ...found, canDelete: access.canDelete };
}

export async function updateRecord(
  db: Db,
  userId: string,
  id: string,
  input: RecordWrite,
): Promise<WorkbenchRecord> {
  await requireView(db, userId);
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
  return getOwned(db, userId, id);
}

export async function deleteRecords(db: Db, userId: string, ids: readonly string[]): Promise<void> {
  await requireDelete(db, userId);
  const uniqueIds = [...new Set(ids)];
  await db.transaction(async (tx) => {
    const found = await tx
      .select({ id: record.id })
      .from(record)
      .where(and(eq(record.userId, userId), inArray(record.id, uniqueIds)));
    if (found.length !== uniqueIds.length) {
      throw new RecordNotFoundError(
        uniqueIds.length === 1 ? "Record not found" : "That batch was not applied.",
      );
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

async function permissions(db: Db, userId: string): Promise<{ canView: boolean; canDelete: boolean }> {
  const rows = await db
    .select()
    .from(recordPermission)
    .where(eq(recordPermission.userId, userId))
    .limit(1);
  const row = rows[0];
  if (!row) return { canView: true, canDelete: true };
  return { canView: row.canView, canDelete: row.canDelete };
}

async function requireView(db: Db, userId: string): Promise<{ canView: boolean; canDelete: boolean }> {
  const access = await permissions(db, userId);
  if (!access.canView) {
    throw new RecordForbiddenError("You do not have permission to view records");
  }
  return access;
}

async function requireDelete(db: Db, userId: string): Promise<void> {
  const access = await requireView(db, userId);
  if (!access.canDelete) {
    throw new RecordForbiddenError("You do not have permission to delete records");
  }
}
