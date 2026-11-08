import { jobSchema, type Job } from "@agent-app/contracts";
import { eq } from "drizzle-orm";
import { AccessDeniedError, requireRecordView } from "../access/record-access.js";
import type { Db } from "../db/types.js";
import { job } from "../db/schema.js";

export class JobNotFoundError extends Error {
  constructor() {
    super("Job not found");
    this.name = "JobNotFoundError";
  }
}

export class JobStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JobStateError";
  }
}

export async function createJob(db: Db, userId: string, outcome: "complete" | "fail"): Promise<Job> {
  await requireRecordView(db, userId);
  const now = new Date();
  const rows = await db
    .insert(job)
    .values({
      userId,
      outcome,
      status: "queued",
      progress: 0,
      attempt: 1,
      replacesJobId: null,
      retriedByJobId: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  const created = rows[0];
  if (!created) throw new Error("Insert did not return a job");
  return toJob(created);
}

export async function getJob(db: Db, userId: string, id: string): Promise<Job> {
  await requireRecordView(db, userId);
  const rows = await db
    .select()
    .from(job)
    .where(eq(job.id, id))
    .limit(1);
  const row = rows[0];
  if (!row || row.userId !== userId) throw new JobNotFoundError();
  return toJob(row);
}

export async function listJobs(db: Db, userId: string): Promise<Job[]> {
  await requireRecordView(db, userId);
  const rows = await db.select().from(job).where(eq(job.userId, userId)).orderBy(job.createdAt);
  return rows.reverse().map((row) => toJob(row));
}

export async function cancelJob(db: Db, userId: string, id: string): Promise<Job> {
  await requireRecordView(db, userId);
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(job).where(eq(job.id, id)).for("update").limit(1);
    const row = rows[0];
    if (!row || row.userId !== userId) throw new JobNotFoundError();
    if (row.status !== "queued" && row.status !== "running") {
      throw new JobStateError("This attempt can no longer be cancelled");
    }
    const updated = await tx
      .update(job)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(job.id, id))
      .returning();
    const next = updated[0];
    if (!next) throw new JobNotFoundError();
    return toJob(next);
  });
}

export async function retryJob(db: Db, userId: string, id: string): Promise<Job> {
  await requireRecordView(db, userId);
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(job).where(eq(job.id, id)).for("update").limit(1);
    const row = rows[0];
    if (!row || row.userId !== userId) throw new JobNotFoundError();
    if (row.status !== "failed") {
      throw new JobStateError("Only a failed attempt can be retried");
    }
    if (row.retriedByJobId) {
      throw new JobStateError("This failed attempt already has a retry");
    }
    const now = new Date();
    const createdRows = await tx
      .insert(job)
      .values({
        userId,
        outcome: "complete",
        status: "queued",
        progress: 0,
        attempt: row.attempt + 1,
        replacesJobId: row.id,
        retriedByJobId: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    const created = createdRows[0];
    if (!created) throw new Error("Insert did not return a job");
    await tx.update(job).set({ retriedByJobId: created.id, updatedAt: now }).where(eq(job.id, row.id));
    return toJob(created);
  });
}

export function toJob(row: {
  id: string;
  status: string;
  outcome: string;
  progress: number;
  attempt: number;
  replacesJobId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Job {
  return jobSchema.parse({
    id: row.id,
    status: row.status,
    outcome: row.outcome,
    progress: row.progress,
    attempt: row.attempt,
    replacesJobId: row.replacesJobId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export { AccessDeniedError };
