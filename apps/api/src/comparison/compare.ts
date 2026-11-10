import { and, eq, sql } from "drizzle-orm";
import { requireRecordView } from "../access/record-access.js";
import { AnalyticsWindowError, assertOrderedWindow, type AnalyticsTimeZone } from "../analytics/aggregate.js";
import type { Db } from "../db/types.js";
import { snapshot, snapshotMember } from "../db/schema.js";
import { SnapshotNotFoundError } from "../snapshots/store.js";
import { diffIdentities, provenanceRows, type Identity } from "./diff.js";

export type Granularity = "hour" | "day";

export async function compareSnapshots(db: Db, userId: string, baselineId: string, laterId: string) {
  await requireRecordView(db, userId);
  const [baseline, later] = await Promise.all([loadOwned(db, userId, baselineId), loadOwned(db, userId, laterId)]);
  return {
    baselineId,
    laterId,
    rows: diffIdentities(membersOf(baseline.members), membersOf(later.members)),
    provenance: provenanceRows(baseline, later),
  };
}

export async function compareWindows(
  db: Db,
  userId: string,
  input: {
    leftFrom: Date;
    leftTo: Date;
    rightFrom: Date;
    rightTo: Date;
    timeZone: AnalyticsTimeZone;
    granularity: Granularity;
  },
) {
  await requireRecordView(db, userId);
  assertOrderedWindow(input.leftFrom, input.leftTo);
  assertOrderedWindow(input.rightFrom, input.rightTo);
  const [left, right] = await Promise.all([
    observationsIn(db, userId, input.leftFrom, input.leftTo),
    observationsIn(db, userId, input.rightFrom, input.rightTo),
  ]);
  return {
    left: { from: input.leftFrom.toISOString(), to: input.leftTo.toISOString() },
    right: { from: input.rightFrom.toISOString(), to: input.rightTo.toISOString() },
    timeZone: input.timeZone,
    granularity: input.granularity,
    rows: diffIdentities(left, right, ["category", "status", "value"]),
    leftCount: left.length,
    rightCount: right.length,
  };
}

export async function bucketInstant(
  db: Db,
  at: Date,
  timeZone: AnalyticsTimeZone,
  granularity: Granularity,
): Promise<string> {
  const unit = granularity === "hour" ? "hour" : "day";
  const result = await db.execute(sql`
    select to_char(date_trunc(${unit}, ${at}::timestamptz at time zone ${timeZone}), 'YYYY-MM-DD') as day
  `);
  const day = String(rowsOf(result)[0]?.day ?? "");
  const [year, month, date] = day.split("-");
  const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(month) - 1];
  return `${Number(date)} ${monthName} ${year}`;
}

async function loadOwned(db: Db, userId: string, id: string) {
  const rows = await db.select().from(snapshot).where(and(eq(snapshot.id, id), eq(snapshot.userId, userId))).limit(1);
  const row = rows[0];
  if (!row) throw new SnapshotNotFoundError();
  const members = await db.select().from(snapshotMember).where(eq(snapshotMember.snapshotId, id));
  return { ...row, members };
}

function membersOf(members: { recordId: string; title: string; status: string; category: string }[]): Identity[] {
  return members.map((member) => ({
    id: member.recordId,
    label: member.title,
    fields: { title: member.title, status: member.status, category: member.category },
  }));
}

async function observationsIn(db: Db, userId: string, from: Date, to: Date): Promise<Identity[]> {
  const result = await db.execute(sql`
    select id, category, status, value::text as value
    from observation
    where user_id = ${userId} and observed_at >= ${from} and observed_at < ${to}
    order by id
  `);
  return rowsOf(result).map((row) => ({
    id: String(row.id),
    label: String(row.category),
    fields: { category: String(row.category), status: String(row.status), value: String(row.value) },
  }));
}

function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  if (result && typeof result === "object" && "rows" in result) return (result as { rows: Record<string, unknown>[] }).rows;
  return [];
}

export { AnalyticsWindowError };
