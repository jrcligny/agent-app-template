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

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
export type ErrorBody = z.infer<typeof errorBodySchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type Note = z.infer<typeof noteSchema>;
export type NoteList = z.infer<typeof noteListSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
