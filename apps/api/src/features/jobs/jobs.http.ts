import { createJobSchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import { z } from "zod";
import { AccessDeniedError } from "../../access/record-access.js";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";
import { JobNotFoundError, JobStateError, cancelJob, createJob, getJob, listJobs, retryJob } from "../../jobs/lifecycle.js";

const jobIdSchema = z.string().uuid();

export function registerJobRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/jobs", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    try {
      return c.json({ jobs: await listJobs(db, user.id) });
    } catch (error) {
      return mapJobError(c, error);
    }
  });

  app.post("/api/jobs", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = createJobSchema.safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose a simulated result.");
    try {
      return c.json(await createJob(db, user.id, parsed.data.outcome), 201);
    } catch (error) {
      return mapJobError(c, error);
    }
  });

  app.get("/api/jobs/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Job not found");
    try {
      return c.json(await getJob(db, user.id, id));
    } catch (error) {
      return mapJobError(c, error);
    }
  });

  app.post("/api/jobs/:id/cancel", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Job not found");
    try {
      return c.json(await cancelJob(db, user.id, id));
    } catch (error) {
      return mapJobError(c, error);
    }
  });

  app.post("/api/jobs/:id/retry", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Job not found");
    try {
      return c.json(await retryJob(db, user.id, id), 201);
    } catch (error) {
      return mapJobError(c, error);
    }
  });
}

function parseId(value: string): string | undefined {
  const parsed = jobIdSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

function mapJobError(c: Context, error: unknown): Response {
  if (error instanceof AccessDeniedError) return errorJson(c, 403, "forbidden", error.message);
  if (error instanceof JobNotFoundError) return errorJson(c, 404, "not_found", error.message);
  if (error instanceof JobStateError) return errorJson(c, 400, "validation", error.message);
  throw error;
}
