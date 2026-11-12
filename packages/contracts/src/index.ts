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

export type ErrorBody = z.infer<typeof errorBodySchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
