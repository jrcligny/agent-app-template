import { savedViewSchema, type Collection, type SavedView, type ViewQuery } from "@agent-app/contracts";
import { and, eq, inArray } from "drizzle-orm";
import { requireCuration, requireRecordView } from "../access/record-access.js";
import type { Db } from "../db/types.js";
import { collection, membership, record, recordTag, savedView, tag } from "../db/schema.js";
import { canonicalViewQuery } from "./query.js";

export class CurationNotFoundError extends Error {
  constructor(message = "That batch was not applied.") {
    super(message);
    this.name = "CurationNotFoundError";
  }
}

export async function applyTag(db: Db, userId: string, name: string, ids: readonly string[]): Promise<void> {
  await requireCuration(db, userId);
  const uniqueIds = [...new Set(ids)];
  await db.transaction(async (tx) => {
    await assertOwnedRecords(tx, userId, uniqueIds);
    const existing = await tx
      .select({ id: tag.id })
      .from(tag)
      .where(and(eq(tag.userId, userId), eq(tag.name, name)))
      .limit(1);
    const tagId =
      existing[0]?.id ??
      (
        await tx.insert(tag).values({ userId, name }).returning({ id: tag.id })
      )[0]?.id;
    if (!tagId) throw new Error("Tag was not created");
    for (const recordId of uniqueIds) {
      await tx
        .insert(recordTag)
        .values({ recordId, tagId, userId })
        .onConflictDoNothing();
    }
  });
}

export async function createCollection(db: Db, userId: string, name: string): Promise<Collection> {
  await requireCuration(db, userId);
  const rows = await db.insert(collection).values({ userId, name, createdAt: new Date(), updatedAt: new Date() }).returning();
  const created = rows[0];
  if (!created) throw new Error("Collection was not created");
  return { id: created.id, name: created.name };
}

export async function listCollectionRecords(
  db: Db,
  userId: string,
  collectionId: string,
): Promise<{ id: string; rationale: string | null }[]> {
  await requireRecordView(db, userId);
  const owned = await db
    .select({ id: collection.id })
    .from(collection)
    .where(and(eq(collection.id, collectionId), eq(collection.userId, userId)))
    .limit(1);
  if (!owned[0]) throw new CurationNotFoundError("Collection not found");
  const rows = await db
    .select({ id: record.id, rationale: membership.rationale })
    .from(membership)
    .innerJoin(record, eq(membership.recordId, record.id))
    .where(and(eq(membership.collectionId, collectionId), eq(record.userId, userId), eq(membership.userId, userId)));
  return rows.map((row) => ({ id: row.id, rationale: row.rationale }));
}

export async function changeMembership(
  db: Db,
  userId: string,
  collectionId: string,
  action: "include" | "exclude" | "annotate",
  ids: readonly string[],
  rationale: string | undefined,
): Promise<void> {
  await requireCuration(db, userId);
  const uniqueIds = [...new Set(ids)];
  await db.transaction(async (tx) => {
    const ownedCollection = await tx
      .select({ id: collection.id })
      .from(collection)
      .where(and(eq(collection.id, collectionId), eq(collection.userId, userId)))
      .for("update")
      .limit(1);
    if (!ownedCollection[0]) throw new CurationNotFoundError("Collection not found");
    await assertOwnedRecords(tx, userId, uniqueIds);
    if (action === "include") {
      for (const recordId of uniqueIds) {
        await tx
          .insert(membership)
          .values({
            collectionId,
            recordId,
            userId,
            rationale: rationale ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [membership.collectionId, membership.recordId],
            set: { rationale: rationale ?? null, updatedAt: new Date() },
          });
      }
      return;
    }
    const current = await tx
      .select({ recordId: membership.recordId, rationale: membership.rationale })
      .from(membership)
      .where(and(eq(membership.collectionId, collectionId), inArray(membership.recordId, uniqueIds)))
      .for("update");
    if (current.length !== uniqueIds.length) throw new CurationNotFoundError();
    if (action === "exclude") {
      await tx
        .delete(membership)
        .where(and(eq(membership.collectionId, collectionId), inArray(membership.recordId, uniqueIds)));
      return;
    }
    await tx
      .update(membership)
      .set({ rationale: rationale ?? null, updatedAt: new Date() })
      .where(and(eq(membership.collectionId, collectionId), inArray(membership.recordId, uniqueIds)));
  });
}

export async function saveNamedView(db: Db, userId: string, name: string, query: ViewQuery): Promise<SavedView> {
  await requireCuration(db, userId);
  const stored = canonicalViewQuery(query);
  const rows = await db
    .insert(savedView)
    .values({ userId, name, query: stored, createdAt: new Date(), updatedAt: new Date() })
    .returning();
  const created = rows[0];
  if (!created) throw new Error("View was not created");
  return savedViewSchema.parse({ id: created.id, name: created.name, query: created.query });
}

export async function listNamedViews(db: Db, userId: string): Promise<SavedView[]> {
  await requireRecordView(db, userId);
  const rows = await db.select().from(savedView).where(eq(savedView.userId, userId));
  return rows.map((row) => savedViewSchema.parse({ id: row.id, name: row.name, query: row.query }));
}

async function assertOwnedRecords(
  tx: { select: Db["select"] },
  userId: string,
  ids: readonly string[],
): Promise<void> {
  const found = await tx
    .select({ id: record.id })
    .from(record)
    .where(and(eq(record.userId, userId), inArray(record.id, [...ids])));
  if (found.length !== ids.length) throw new CurationNotFoundError();
}
