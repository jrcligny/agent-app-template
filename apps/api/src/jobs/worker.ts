import { eq, inArray } from "drizzle-orm";
import { job } from "../db/schema.js";
import type { Db } from "../db/types.js";

const step = 25;

export async function advanceJobs(db: Db, limit = 5): Promise<number> {
  return db.transaction(async (tx) => {
    const ready = await tx
      .select({ id: job.id })
      .from(job)
      .where(inArray(job.status, ["queued", "running"]))
      .orderBy(job.createdAt)
      .limit(limit)
      .for("update", { skipLocked: true });
    for (const item of ready) {
      const rows = await tx.select().from(job).where(eq(job.id, item.id)).limit(1);
      const current = rows[0];
      if (!current || (current.status !== "queued" && current.status !== "running")) continue;
      const progress = Math.min(100, current.progress + step);
      const status = progress < 100 ? "running" : current.outcome === "fail" ? "failed" : "succeeded";
      await tx
        .update(job)
        .set({ status, progress, updatedAt: new Date() })
        .where(eq(job.id, current.id));
    }
    return ready.length;
  });
}
