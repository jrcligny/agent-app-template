import { eq } from "drizzle-orm";
import { recordPermission } from "../db/schema.js";
import type { Db } from "../db/types.js";

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export async function recordAccess(
  db: Db,
  userId: string,
): Promise<{ canView: boolean; canDelete: boolean; canCurate: boolean }> {
  const rows = await db.select().from(recordPermission).where(eq(recordPermission.userId, userId)).limit(1);
  const row = rows[0];
  if (!row) return { canView: true, canDelete: true, canCurate: true };
  return { canView: row.canView, canDelete: row.canDelete, canCurate: row.canCurate };
}

export async function requireRecordView(
  db: Db,
  userId: string,
): Promise<{ canView: boolean; canDelete: boolean; canCurate: boolean }> {
  const access = await recordAccess(db, userId);
  if (!access.canView) {
    throw new AccessDeniedError("You do not have permission to view records");
  }
  return access;
}

export async function requireRecordDelete(db: Db, userId: string): Promise<void> {
  const access = await requireRecordView(db, userId);
  if (!access.canDelete) {
    throw new AccessDeniedError("You do not have permission to delete records");
  }
}

export async function requireCuration(db: Db, userId: string): Promise<void> {
  const access = await requireRecordView(db, userId);
  if (!access.canCurate) {
    throw new AccessDeniedError("You do not have permission to curate records");
  }
}
