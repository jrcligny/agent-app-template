import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("api"),
});

export const readinessResponseSchema = z.object({
  status: z.enum(["ok", "unavailable"]),
  service: z.literal("api"),
  database: z.enum(["ok", "unavailable"]),
});

export const errorCodeSchema = z.enum([
  "unauthorized",
  "forbidden",
  "validation",
  "not_found",
  "internal",
]);

export const errorBodySchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string().min(1),
  }),
});

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
});

export const noteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().max(10_000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const noteListSchema = z.object({
  notes: z.array(noteSchema),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().max(10_000),
});

export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().max(10_000).optional(),
  })
  .refine((value) => value.title !== undefined || value.body !== undefined, {
    message: "Provide a title or a body to update",
  });

export const recordStatusSchema = z.enum(["open", "closed"]);

export const recordSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: recordStatusSchema,
  ownerName: z.string().min(1),
  summary: z.string().max(2_000),
  body: z.string().max(20_000),
  reason: z.string().min(1).max(2_000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const recordWriteSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    status: recordStatusSchema,
    summary: z.string().trim().max(2_000),
    body: z.string().max(20_000),
    reason: z.string().trim().max(2_000).optional(),
  })
  .superRefine((value, context) => {
    if (value.status === "closed" && !value.reason) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Enter a reason for closing the record.",
      });
    }
    if (value.status === "open" && value.reason) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "An open record cannot include a reason.",
      });
    }
  });

export const recordPageSchema = z.object({
  records: z.array(recordSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  canDelete: z.boolean(),
  canCurate: z.boolean(),
});

export const recordCountsSchema = z.object({
  all: z.number().int().nonnegative(),
  open: z.number().int().nonnegative(),
});

export const recordDetailSchema = recordSchema.extend({
  canDelete: z.boolean(),
});

export const bulkDeleteRecordsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

export const jobStatusSchema = z.enum(["queued", "running", "succeeded", "failed", "cancelled"]);
export const jobOutcomeSchema = z.enum(["complete", "fail"]);

export const jobSchema = z.object({
  id: z.string().uuid(),
  status: jobStatusSchema,
  outcome: jobOutcomeSchema,
  progress: z.number().int().min(0).max(100),
  attempt: z.number().int().positive(),
  replacesJobId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createJobSchema = z.object({
  outcome: jobOutcomeSchema,
});

export const jobListSchema = z.object({
  jobs: z.array(jobSchema),
});

export const activityEventSchema = z.object({
  id: z.string().uuid(),
  kind: z.string().min(1),
  summary: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const activityPageSchema = z.object({
  events: z.array(activityEventSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const viewQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(["open", "closed"]).optional(),
  tag: z.string().trim().regex(/^[a-z0-9-]{1,40}$/).optional(),
  collection: z.string().uuid().optional(),
  sort: z.enum(["title", "-title"]).optional(),
  page: z.number().int().min(1).max(10_000).optional(),
});

export const savedViewSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
  query: z.string().max(500),
});

export const saveViewSchema = z.object({
  name: z.string().trim().min(1).max(80),
  query: viewQuerySchema,
});

export const collectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
});

export const membershipChangeSchema = z.object({
  action: z.enum(["include", "exclude", "annotate"]),
  ids: z.array(z.string().uuid()).min(1).max(100),
  rationale: z.string().trim().max(500).optional(),
});

export const settingsPageSizeSchema = z.union([z.literal(10), z.literal(25), z.literal(50)]);

export const settingsSchema = z.object({
  displayName: z.string().trim().min(1).max(200),
  pageSize: settingsPageSizeSchema,
});

export const analyticsTimeZoneSchema = z.enum(["UTC", "Europe/Paris"]);

export const analyticsReportSchema = z.object({
  window: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
    timeZone: analyticsTimeZoneSchema,
  }),
  totals: z.object({
    count: z.number().int().nonnegative(),
    sum: z.number().int(),
    openCount: z.number().int().nonnegative(),
    closedCount: z.number().int().nonnegative(),
  }),
  baseline: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
    observations: z.number().int().nonnegative(),
    deltaCount: z.number().int().nullable(),
    deltaSum: z.number().int().nullable(),
  }),
  countSeries: z.array(z.object({ day: z.string(), count: z.number().int().nonnegative() })),
  valueSeries: z.array(z.object({ day: z.string(), sum: z.number().int() })),
  statusBars: z.array(z.object({ status: recordStatusSchema, count: z.number().int().nonnegative() })),
  categoryBars: z.array(z.object({ category: z.string(), count: z.number().int().nonnegative() })),
  synthetic: z.literal(true),
  fixture: z.enum(["alpha"]).nullable(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
export type ErrorBody = z.infer<typeof errorBodySchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type Note = z.infer<typeof noteSchema>;
export type NoteList = z.infer<typeof noteListSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type RecordStatus = z.infer<typeof recordStatusSchema>;
export type WorkbenchRecord = z.infer<typeof recordSchema>;
export type RecordWrite = z.infer<typeof recordWriteSchema>;
export type RecordPage = z.infer<typeof recordPageSchema>;
export type RecordCounts = z.infer<typeof recordCountsSchema>;
export type RecordDetail = z.infer<typeof recordDetailSchema>;
export type BulkDeleteRecords = z.infer<typeof bulkDeleteRecordsSchema>;
export type Job = z.infer<typeof jobSchema>;
export type JobList = z.infer<typeof jobListSchema>;
export type CreateJob = z.infer<typeof createJobSchema>;
export type ActivityEvent = z.infer<typeof activityEventSchema>;
export type ActivityPage = z.infer<typeof activityPageSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type ViewQuery = z.infer<typeof viewQuerySchema>;
export type SavedView = z.infer<typeof savedViewSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type AnalyticsReport = z.infer<typeof analyticsReportSchema>;
