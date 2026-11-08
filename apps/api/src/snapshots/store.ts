import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { requireCuration, requireRecordView } from "../access/record-access.js";
import type { Db } from "../db/types.js";
import { collection, membership, record, snapshot, snapshotMember, snapshotTarget } from "../db/schema.js";

export class SnapshotNotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "SnapshotNotFoundError";
  }
}

export class SnapshotValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SnapshotValidationError";
  }
}

export type SnapshotMember = {
  recordId: string;
  title: string;
  status: "open" | "closed";
  category: string;
  sourceUpdatedAt: string;
};

export type PublishedSnapshot = {
  id: string;
  collectionId: string;
  name: string;
  revision: number;
  createdAt: string;
  members: SnapshotMember[];
};

export type CoverageReport = {
  memberCount: number;
  target: string[] | null;
  counts: { category: string; count: number }[];
  missing: string[];
};

export async function listDraftCollections(db: Db, userId: string) {
  await requireRecordView(db, userId);
  const result = await db.execute(sql`
    select collection.id, collection.name, count(membership.record_id)::int as member_count
    from collection
    left join membership on membership.collection_id = collection.id and membership.user_id = collection.user_id
    where collection.user_id = ${userId}
    group by collection.id, collection.name
    order by collection.name
  `);
  return rowsOf(result).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    memberCount: Number(row.member_count ?? 0),
  }));
}

export async function readDraft(db: Db, userId: string, collectionId: string) {
  await requireRecordView(db, userId);
  const owned = await db
    .select({ id: collection.id, name: collection.name })
    .from(collection)
    .where(and(eq(collection.id, collectionId), eq(collection.userId, userId)))
    .limit(1);
  const draft = owned[0];
  if (!draft) throw new SnapshotNotFoundError("Collection not found");
  const rows = await db
    .select({
      id: record.id,
      title: record.title,
      status: record.status,
      updatedAt: record.updatedAt,
    })
    .from(membership)
    .innerJoin(record, eq(membership.recordId, record.id))
    .where(and(eq(membership.collectionId, collectionId), eq(membership.userId, userId), eq(record.userId, userId)))
    .orderBy(asc(record.title));
  const categories = await categoriesFor(db, userId, rows.map((row) => row.id));
  return {
    id: draft.id,
    name: draft.name,
    members: rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status === "closed" ? "closed" as const : "open" as const,
      category: categories.get(row.id) ?? "",
    })),
  };
}

export async function publishSnapshot(
  db: Db,
  userId: string,
  input: { collectionId: string; name: string; target?: string[]; submitKey?: string; recordIds?: string[] },
): Promise<PublishedSnapshot> {
  await requireCuration(db, userId);
  const name = input.name.trim();
  if (!name) throw new SnapshotValidationError("Enter a publish name.");
  const target = normalizeTarget(input.target);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);
    if (input.submitKey) {
      const existing = await tx
        .select({ id: snapshot.id })
        .from(snapshot)
        .where(and(eq(snapshot.userId, userId), eq(snapshot.submitKey, input.submitKey)))
        .limit(1);
      if (existing[0]) return readSnapshot(tx, userId, existing[0].id);
    }
    const locked = await tx
      .select({ id: collection.id })
      .from(collection)
      .where(and(eq(collection.id, input.collectionId), eq(collection.userId, userId)))
      .for("update")
      .limit(1);
    if (!locked[0]) throw new SnapshotNotFoundError("Collection not found");
    const membershipRows = await tx
      .select({ recordId: membership.recordId })
      .from(membership)
      .where(and(eq(membership.collectionId, input.collectionId), eq(membership.userId, userId)))
      .for("update");
    const memberIds = membershipRows.map((row) => row.recordId);
    if (input.recordIds && !sameIds(input.recordIds, memberIds)) throw new SnapshotNotFoundError();
    const records = memberIds.length
      ? await tx
          .select({
            id: record.id,
            title: record.title,
            status: record.status,
            updatedAt: record.updatedAt,
          })
          .from(record)
          .where(and(eq(record.userId, userId), inArray(record.id, memberIds)))
          .for("update")
      : [];
    if (records.length !== memberIds.length) throw new SnapshotNotFoundError();
    const categories = await categoriesFor(tx, userId, memberIds);
    const revisionRows = await tx.execute(sql`
      select coalesce(max(revision), 0)::int as revision from snapshot where user_id = ${userId}
    `);
    const revision = Number(rowsOf(revisionRows)[0]?.revision ?? 0) + 1;
    const createdRows = await tx
      .insert(snapshot)
      .values({
        userId,
        collectionId: input.collectionId,
        name,
        revision,
        submitKey: input.submitKey ?? null,
        createdAt: new Date(),
      })
      .returning();
    const created = createdRows[0];
    if (!created) throw new Error("Snapshot was not created");
    if (records.length > 0) {
      await tx.insert(snapshotMember).values(
        records.map((row) => ({
          snapshotId: created.id,
          recordId: row.id,
          title: row.title,
          status: row.status,
          category: categories.get(row.id) ?? "",
          sourceUpdatedAt: row.updatedAt,
        })),
      );
    }
    if (target.length > 0) {
      await tx.insert(snapshotTarget).values(
        target.map((category, position) => ({ snapshotId: created.id, category, position })),
      );
    }
    return readSnapshot(tx, userId, created.id);
  });
}

export async function readSnapshot(db: Db, userId: string, snapshotId: string): Promise<PublishedSnapshot> {
  await requireRecordView(db, userId);
  const rows = await db
    .select()
    .from(snapshot)
    .where(and(eq(snapshot.id, snapshotId), eq(snapshot.userId, userId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new SnapshotNotFoundError();
  const members = await db
    .select()
    .from(snapshotMember)
    .where(eq(snapshotMember.snapshotId, row.id))
    .orderBy(asc(snapshotMember.title));
  return {
    id: row.id,
    collectionId: row.collectionId,
    name: row.name,
    revision: row.revision,
    createdAt: row.createdAt.toISOString(),
    members: members.map((member) => ({
      recordId: member.recordId,
      title: member.title,
      status: member.status === "closed" ? "closed" : "open",
      category: member.category,
      sourceUpdatedAt: member.sourceUpdatedAt.toISOString(),
    })),
  };
}

export async function readCoverage(db: Db, userId: string, snapshotId: string): Promise<CoverageReport> {
  const published = await readSnapshot(db, userId, snapshotId);
  const targets = await db
    .select({ category: snapshotTarget.category })
    .from(snapshotTarget)
    .where(eq(snapshotTarget.snapshotId, published.id))
    .orderBy(asc(snapshotTarget.position));
  return coverageFor(published.members, targets.map((row) => row.category));
}

export function coverageFor(members: { category: string }[], target: string[]): CoverageReport {
  const tallies = new Map<string, number>();
  for (const member of members) {
    tallies.set(member.category, (tallies.get(member.category) ?? 0) + 1);
  }
  if (target.length === 0) {
    return {
      memberCount: members.length,
      target: null,
      counts: [...tallies.entries()]
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([category, count]) => ({ category, count })),
      missing: [],
    };
  }
  return {
    memberCount: members.length,
    target,
    counts: target.map((category) => ({ category, count: tallies.get(category) ?? 0 })),
    missing: target.filter((category) => (tallies.get(category) ?? 0) === 0),
  };
}

function normalizeTarget(values: string[] | undefined): string[] {
  const seen = new Set<string>();
  const target: string[] = [];
  for (const value of values ?? []) {
    const category = value.trim();
    if (!category || seen.has(category)) continue;
    if (category.length > 80) throw new SnapshotValidationError("Use a shorter category name.");
    seen.add(category);
    target.push(category);
  }
  if (target.length > 40) throw new SnapshotValidationError("Use at most 40 target categories.");
  return target;
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

async function categoriesFor(db: Db, userId: string, ids: string[]): Promise<Map<string, string>> {
  const categories = new Map<string, string>();
  if (ids.length === 0) return categories;
  const result = await db.execute(sql`
    select distinct on (record_id) record_id, category
    from observation
    where user_id = ${userId} and record_id in (${sql.join(ids.map((id) => sql`${id}::uuid`), sql`, `)})
    order by record_id, observed_at desc
  `);
  for (const row of rowsOf(result)) {
    categories.set(String(row.record_id), String(row.category));
  }
  return categories;
}

function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: Record<string, unknown>[] }).rows;
  }
  return [];
}
