import { errorBodySchema, type ErrorBody } from "@agent-app/contracts";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorBody["error"]["code"] | "unknown",
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  parse: (value: unknown) => T,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("accept", "application/json");
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const response = await fetch(path, { ...init, headers, credentials: "include" });
  if (response.status === 204) {
    return parse(undefined);
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = errorBodySchema.safeParse(payload);
    throw new ApiError(
      response.status,
      error.success ? error.data.error.code : "unknown",
      error.success ? error.data.error.message : "Request failed",
    );
  }
  return parse(payload);
}
