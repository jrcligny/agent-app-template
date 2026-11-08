import { bulkDeleteRecordsSchema, recordWriteSchema } from "@agent-app/contracts";
import type { Context, Hono } from "hono";
import { z } from "zod";
import type { Auth } from "../../auth/create-auth.js";
import { requireUser } from "../../auth/session.js";
import type { Db } from "../../db/types.js";
import { errorJson } from "../../http/errors.js";
import { pageSizeFor } from "../../settings/preferences.js";
import {
  RecordForbiddenError,
  RecordNotFoundError,
  countRecords,
  createRecord,
  deleteRecords,
  getRecord,
  listRecords,
  updateRecord,
} from "./records.service.js";

const recordIdSchema = z.string().uuid();

const listQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(["open", "closed"]).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.enum(["title", "-title"]).default("title"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export function registerRecordRoutes(app: Hono, db: Db, auth: Auth): void {
  app.get("/api/records/counts", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    try {
      return c.json(await countRecords(db, user.id));
    } catch (error) {
      return mapRecordError(c, error);
    }
  });

  app.post("/api/records/bulk-delete", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = bulkDeleteRecordsSchema.safeParse(await readJson(c));
    if (!parsed.success) return errorJson(c, 400, "validation", "Choose at least one record.");
    try {
      await deleteRecords(db, user.id, parsed.data.ids);
      return c.body(null, 204);
    } catch (error) {
      return mapRecordError(c, error);
    }
  });

  app.get("/api/records", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = listQuerySchema.safeParse({
      q: emptyAsUndefined(c.req.query("q")),
      status: emptyAsUndefined(c.req.query("status")),
      category: emptyAsUndefined(c.req.query("category")),
      from: emptyAsUndefined(c.req.query("from")),
      to: emptyAsUndefined(c.req.query("to")),
      sort: emptyAsUndefined(c.req.query("sort")),
      page: emptyAsUndefined(c.req.query("page")),
      pageSize: emptyAsUndefined(c.req.query("pageSize")),
    });
    if (!parsed.success) return errorJson(c, 400, "validation", "Those table filters are not valid.");
    try {
      if ((parsed.data.from && !parsed.data.to) || (!parsed.data.from && parsed.data.to)) {
        return errorJson(c, 400, "validation", "Provide both the start and the end of the window.");
      }
      if (parsed.data.from && parsed.data.to && new Date(parsed.data.from) >= new Date(parsed.data.to)) {
        return errorJson(c, 400, "validation", "Choose a window whose start is before its end.");
      }
      const pageSize = parsed.data.pageSize ?? (await pageSizeFor(db, user.id));
      return c.json(
        await listRecords(db, user.id, {
          ...parsed.data,
          pageSize,
          from: parsed.data.from ? new Date(parsed.data.from) : undefined,
          to: parsed.data.to ? new Date(parsed.data.to) : undefined,
        }),
      );
    } catch (error) {
      return mapRecordError(c, error);
    }
  });

  app.post("/api/records", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const parsed = recordWriteSchema.safeParse(await readJson(c));
    if (!parsed.success) return validationError(c, parsed.error);
    try {
      return c.json(await createRecord(db, user.id, parsed.data), 201);
    } catch (error) {
      return mapRecordError(c, error);
    }
  });

  app.get("/api/records/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseRecordId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Record not found");
    try {
      return c.json(await getRecord(db, user.id, id));
    } catch (error) {
      return mapRecordError(c, error);
    }
  });

  app.patch("/api/records/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseRecordId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Record not found");
    const parsed = recordWriteSchema.safeParse(await readJson(c));
    if (!parsed.success) return validationError(c, parsed.error);
    try {
      return c.json(await updateRecord(db, user.id, id, parsed.data));
    } catch (error) {
      return mapRecordError(c, error);
    }
  });

  app.delete("/api/records/:id", async (c) => {
    const user = await requireUser(c, auth);
    if (user instanceof Response) return user;
    const id = parseRecordId(c.req.param("id"));
    if (!id) return errorJson(c, 404, "not_found", "Record not found");
    try {
      await deleteRecords(db, user.id, [id]);
      return c.body(null, 204);
    } catch (error) {
      return mapRecordError(c, error);
    }
  });
}

function parseRecordId(value: string): string | undefined {
  const parsed = recordIdSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function emptyAsUndefined(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

function validationError(c: Context, error: z.ZodError): Response {
  const reason = error.issues.some((issue) => issue.path[0] === "reason");
  return errorJson(
    c,
    400,
    "validation",
    reason ? "Enter a reason for closing the record." : "Check the record fields.",
  );
}

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

function mapRecordError(c: Context, error: unknown): Response {
  if (error instanceof RecordForbiddenError) {
    return errorJson(c, 403, "forbidden", error.message);
  }
  if (error instanceof RecordNotFoundError) {
    return errorJson(c, 404, "not_found", error.message);
  }
  throw error;
}
