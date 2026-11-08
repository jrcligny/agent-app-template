import { settingsSchema, type Settings } from "@agent-app/contracts";
import { eq } from "drizzle-orm";
import { user, workbenchSettings } from "../db/schema.js";
import type { Db } from "../db/types.js";

const defaultPageSize = 25;

export async function readSettings(db: Db, userId: string): Promise<Settings> {
  const rows = await db
    .select({
      displayName: workbenchSettings.displayName,
      pageSize: workbenchSettings.pageSize,
      accountName: user.name,
    })
    .from(user)
    .leftJoin(workbenchSettings, eq(workbenchSettings.userId, user.id))
    .where(eq(user.id, userId))
    .limit(1);
  const row = rows[0];
  if (!row) {
    return { displayName: "Account", pageSize: defaultPageSize };
  }
  return settingsSchema.parse({
    displayName: row.displayName ?? row.accountName,
    pageSize: row.pageSize ?? defaultPageSize,
  });
}

export async function pageSizeFor(db: Db, userId: string): Promise<number> {
  return (await readSettings(db, userId)).pageSize;
}

export async function saveSettings(db: Db, userId: string, input: Settings): Promise<Settings> {
  const saved = settingsSchema.parse(input);
  await db.transaction(async (tx) => {
    await tx.update(user).set({ name: saved.displayName, updatedAt: new Date() }).where(eq(user.id, userId));
    await tx
      .insert(workbenchSettings)
      .values({ userId, displayName: saved.displayName, pageSize: saved.pageSize })
      .onConflictDoUpdate({
        target: workbenchSettings.userId,
        set: { displayName: saved.displayName, pageSize: saved.pageSize },
      });
  });
  return saved;
}
