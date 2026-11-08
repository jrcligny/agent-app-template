import { and, asc, eq } from "drizzle-orm";
import { requireCuration, requireRecordView } from "../access/record-access.js";
import type { Db } from "../db/types.js";
import { record, recordArtifact, recordSection } from "../db/schema.js";
import { assertMediaType, assertSameOriginPath, decodeArtifact, maxArtifactBytes, safeFileName } from "./safety.js";

export class EvidenceNotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "EvidenceNotFoundError";
  }
}

export class EvidenceUnreadableError extends Error {
  constructor() {
    super("The file could not be read");
    this.name = "EvidenceUnreadableError";
  }
}

export type SectionNode = {
  id: string;
  title: string;
  text: string;
  link: string | null;
  children: SectionNode[];
};

export type ArtifactMetadata = {
  id: string;
  recordId: string;
  fileName: string;
  mediaType: string;
  byteSize: number;
  createdAt: string;
  contentPath: string;
};

export async function listSections(db: Db, userId: string, recordId: string): Promise<SectionNode[]> {
  await requireRecordView(db, userId);
  await assertOwnedRecord(db, userId, recordId);
  const rows = await db
    .select()
    .from(recordSection)
    .where(and(eq(recordSection.recordId, recordId), eq(recordSection.userId, userId)))
    .orderBy(asc(recordSection.createdAt));
  const nodes = new Map<string, SectionNode>();
  for (const row of rows) {
    nodes.set(row.id, { id: row.id, title: row.title, text: row.body, link: row.link, children: [] });
  }
  const roots: SectionNode[] = [];
  for (const row of rows) {
    const node = nodes.get(row.id);
    if (!node) continue;
    const parent = row.parentId ? nodes.get(row.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function addSection(
  db: Db,
  userId: string,
  recordId: string,
  input: { title: string; text: string; parentId?: string; link?: string },
): Promise<SectionNode> {
  await requireCuration(db, userId);
  await assertOwnedRecord(db, userId, recordId);
  const link = input.link ? assertSameOriginPath(input.link) : null;
  if (input.parentId) {
    const parent = await db
      .select({ id: recordSection.id })
      .from(recordSection)
      .where(and(eq(recordSection.id, input.parentId), eq(recordSection.recordId, recordId), eq(recordSection.userId, userId)))
      .limit(1);
    if (!parent[0]) throw new EvidenceNotFoundError("Section not found");
  }
  const rows = await db
    .insert(recordSection)
    .values({
      recordId,
      userId,
      parentId: input.parentId ?? null,
      title: input.title.trim(),
      body: input.text,
      link,
      createdAt: new Date(),
    })
    .returning();
  const created = rows[0];
  if (!created) throw new Error("Section was not created");
  return { id: created.id, title: created.title, text: created.body, link: created.link, children: [] };
}

export async function addArtifact(
  db: Db,
  userId: string,
  recordId: string,
  input: { fileName: string; mediaType: string; contentBase64: string },
): Promise<ArtifactMetadata> {
  await requireCuration(db, userId);
  await assertOwnedRecord(db, userId, recordId);
  const mediaType = assertMediaType(input.mediaType);
  const bytes = decodeArtifact(input.contentBase64, mediaType);
  if (bytes.byteLength > maxArtifactBytes) {
    throw new Error("The file is larger than the demo limit.");
  }
  const rows = await db
    .insert(recordArtifact)
    .values({
      recordId,
      userId,
      fileName: safeFileName(input.fileName),
      mediaType,
      byteSize: bytes.byteLength,
      contentBase64: Buffer.from(bytes).toString("base64"),
      createdAt: new Date(),
    })
    .returning();
  const created = rows[0];
  if (!created) throw new Error("Artifact was not created");
  return toMetadata(created);
}

export async function listArtifacts(db: Db, userId: string, recordId: string): Promise<ArtifactMetadata[]> {
  await requireRecordView(db, userId);
  await assertOwnedRecord(db, userId, recordId);
  const rows = await db
    .select()
    .from(recordArtifact)
    .where(and(eq(recordArtifact.recordId, recordId), eq(recordArtifact.userId, userId)))
    .orderBy(asc(recordArtifact.createdAt));
  return rows.map((row) => toMetadata(row));
}

export async function readArtifact(
  db: Db,
  userId: string,
  artifactId: string,
): Promise<{ metadata: ArtifactMetadata; bytes: Uint8Array }> {
  await requireRecordView(db, userId);
  const rows = await db.select().from(recordArtifact).where(eq(recordArtifact.id, artifactId)).limit(1);
  const row = rows[0];
  if (!row || row.userId !== userId) throw new EvidenceNotFoundError();
  const recordStillThere = await db
    .select({ id: record.id })
    .from(record)
    .where(and(eq(record.id, row.recordId), eq(record.userId, userId)))
    .limit(1);
  if (!recordStillThere[0]) throw new EvidenceNotFoundError();
  if (!row.contentBase64) throw new EvidenceUnreadableError();
  const bytes = Uint8Array.from(Buffer.from(row.contentBase64, "base64"));
  if (bytes.byteLength !== row.byteSize) throw new EvidenceUnreadableError();
  return { metadata: toMetadata(row), bytes };
}

async function assertOwnedRecord(db: Db, userId: string, recordId: string): Promise<void> {
  const rows = await db
    .select({ id: record.id })
    .from(record)
    .where(and(eq(record.id, recordId), eq(record.userId, userId)))
    .limit(1);
  if (!rows[0]) throw new EvidenceNotFoundError("Record not found");
}

function toMetadata(row: {
  id: string;
  recordId: string;
  fileName: string;
  mediaType: string;
  byteSize: number;
  createdAt: Date;
}): ArtifactMetadata {
  return {
    id: row.id,
    recordId: row.recordId,
    fileName: row.fileName,
    mediaType: row.mediaType,
    byteSize: row.byteSize,
    createdAt: row.createdAt.toISOString(),
    contentPath: `/api/artifacts/${row.id}/bytes`,
  };
}
