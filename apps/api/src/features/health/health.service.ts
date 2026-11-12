import { sql } from "drizzle-orm";
import type { Db } from "../../db/types.js";

export async function databaseReady(db: Db): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    const result = await db.execute(sql`select to_regclass('public.user')::text as name`);
    const row = firstRow(result);
    return Boolean(row?.name);
  } catch {
    return false;
  }
}

function firstRow(result: unknown): { name?: string | null } | undefined {
  if (Array.isArray(result)) {
    return result[0] as { name?: string | null } | undefined;
  }
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows: unknown[] }).rows;
    return rows[0] as { name?: string | null } | undefined;
  }
  return undefined;
}
