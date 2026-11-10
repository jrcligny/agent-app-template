import { and, asc, eq } from "drizzle-orm";
import { requireRecordView } from "../access/record-access.js";
import type { Db } from "../db/types.js";
import { collection, snapshot, snapshotAttempt, snapshotMember } from "../db/schema.js";

export class HierarchyNotFoundError extends Error {
  constructor() {
    super("Not found");
    this.name = "HierarchyNotFoundError";
  }
}

export class HierarchyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HierarchyValidationError";
  }
}

type ItemStatus = "open" | "closed";
type StatusFilter = "" | ItemStatus;

export type HierarchyAttempt = { id: string; label: string; attemptedAt: string };
export type HierarchyItem = {
  id: string;
  title: string;
  status: ItemStatus;
  category: string;
  attempts: HierarchyAttempt[];
};

export async function readHierarchy(
  db: Db,
  userId: string,
  input: {
    collectionId: string;
    snapshotId: string | null;
    itemId: string | null;
    attemptId: string | null;
    status: StatusFilter;
  },
) {
  await requireRecordView(db, userId);
  if (input.itemId && !input.snapshotId) throw new HierarchyValidationError("Choose a snapshot before an item.");
  if (input.attemptId && !input.itemId) throw new HierarchyValidationError("Choose an item before an attempt.");

  const ownedCollection = await loadCollection(db, userId, input.collectionId);
  if (!ownedCollection) throw new HierarchyNotFoundError();

  const ownedSnapshot = input.snapshotId ? await loadSnapshot(db, userId, input.snapshotId) : null;
  if (input.snapshotId && (!ownedSnapshot || ownedSnapshot.collectionId !== ownedCollection.id)) {
    throw new HierarchyNotFoundError();
  }

  const snapshots = await db
    .select({ id: snapshot.id, name: snapshot.name, revision: snapshot.revision })
    .from(snapshot)
    .where(and(eq(snapshot.userId, userId), eq(snapshot.collectionId, ownedCollection.id)))
    .orderBy(asc(snapshot.revision));

  const members = ownedSnapshot
    ? await db.select().from(snapshotMember).where(eq(snapshotMember.snapshotId, ownedSnapshot.id))
    : [];
  const selected = input.itemId ? members.find((member) => member.recordId === input.itemId) : undefined;
  if (input.itemId && !selected) throw new HierarchyNotFoundError();

  const attempts = selected ? await loadAttempts(db, userId, selected.snapshotId, selected.recordId) : [];
  const selectedAttempt = input.attemptId ? attempts.find((row) => row.id === input.attemptId) : undefined;
  if (input.attemptId && !selectedAttempt) throw new HierarchyNotFoundError();

  const items = members
    .filter((member) => input.status === "" || member.status === input.status)
    .map((member) => ({
      id: member.recordId,
      title: member.title,
      status: asStatus(member.status),
      category: member.category,
    }))
    .sort((left, right) => left.title.localeCompare(right.title));

  const item: HierarchyItem | null = selected
    ? {
        id: selected.recordId,
        title: selected.title,
        status: asStatus(selected.status),
        category: selected.category,
        attempts,
      }
    : null;

  return {
    collection: { id: ownedCollection.id, name: ownedCollection.name },
    snapshots,
    snapshot: ownedSnapshot ? { id: ownedSnapshot.id, name: ownedSnapshot.name, revision: ownedSnapshot.revision } : null,
    items,
    item,
    attempt: selectedAttempt ?? null,
    status: input.status,
  };
}

export async function storeAttempt(
  db: Db,
  userId: string,
  input: { snapshotId: string; itemId: string; label: string; attemptedAt?: Date },
): Promise<HierarchyAttempt> {
  await requireRecordView(db, userId);
  const label = input.label.trim();
  if (label.length === 0) throw new HierarchyValidationError("Enter an attempt label.");
  const ownedSnapshot = await loadSnapshot(db, userId, input.snapshotId);
  if (!ownedSnapshot) throw new HierarchyNotFoundError();
  const members = await db
    .select()
    .from(snapshotMember)
    .where(and(eq(snapshotMember.snapshotId, ownedSnapshot.id), eq(snapshotMember.recordId, input.itemId)))
    .limit(1);
  if (!members[0]) throw new HierarchyNotFoundError();
  const rows = await db
    .insert(snapshotAttempt)
    .values({
      snapshotId: ownedSnapshot.id,
      recordId: input.itemId,
      userId,
      label,
      attemptedAt: input.attemptedAt ?? new Date(),
    })
    .returning();
  const row = rows[0];
  if (!row) throw new HierarchyValidationError("Enter an attempt label.");
  return { id: row.id, label: row.label, attemptedAt: row.attemptedAt.toISOString() };
}

async function loadCollection(db: Db, userId: string, id: string) {
  const rows = await db
    .select({ id: collection.id, name: collection.name })
    .from(collection)
    .where(and(eq(collection.id, id), eq(collection.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

async function loadSnapshot(db: Db, userId: string, id: string) {
  const rows = await db
    .select({ id: snapshot.id, name: snapshot.name, revision: snapshot.revision, collectionId: snapshot.collectionId })
    .from(snapshot)
    .where(and(eq(snapshot.id, id), eq(snapshot.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

async function loadAttempts(db: Db, userId: string, snapshotId: string, recordId: string): Promise<HierarchyAttempt[]> {
  const rows = await db
    .select()
    .from(snapshotAttempt)
    .where(and(eq(snapshotAttempt.userId, userId), eq(snapshotAttempt.snapshotId, snapshotId), eq(snapshotAttempt.recordId, recordId)))
    .orderBy(asc(snapshotAttempt.attemptedAt), asc(snapshotAttempt.id));
  return rows.map((row) => ({ id: row.id, label: row.label, attemptedAt: row.attemptedAt.toISOString() }));
}

function asStatus(value: string): ItemStatus {
  if (value === "closed") return "closed";
  if (value === "open") return "open";
  throw new HierarchyValidationError("Choose open or closed.");
}
