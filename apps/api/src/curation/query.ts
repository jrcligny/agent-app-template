import { viewQuerySchema, type ViewQuery } from "@agent-app/contracts";

const allowedKeys = new Set(["q", "status", "tag", "collection", "sort", "page"]);

export function canonicalViewQuery(input: ViewQuery): string {
  const parsed = viewQuerySchema.parse(input);
  const params = new URLSearchParams();
  if (parsed.q) params.set("q", parsed.q);
  if (parsed.status) params.set("status", parsed.status);
  if (parsed.tag) params.set("tag", parsed.tag);
  if (parsed.collection) params.set("collection", parsed.collection);
  if (parsed.sort) params.set("sort", parsed.sort);
  if (parsed.page && parsed.page > 1) params.set("page", String(parsed.page));
  return params.toString();
}

export function parseStoredQuery(query: string): ViewQuery {
  if (query.includes("://") || query.includes("//") || query.includes("\\") || query.includes("@")) {
    throw new Error("Stored view query is not a filter");
  }
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  for (const key of params.keys()) {
    if (!allowedKeys.has(key)) throw new Error("Stored view query has an unknown filter");
  }
  return viewQuerySchema.parse({
    q: params.get("q") ?? undefined,
    status: params.get("status") ?? undefined,
    tag: params.get("tag") ?? undefined,
    collection: params.get("collection") ?? undefined,
    sort: params.get("sort") ?? undefined,
    page: params.get("page") ? Number(params.get("page")) : undefined,
  });
}

export function recordsPathForQuery(query: string): string {
  const safe = canonicalViewQuery(parseStoredQuery(query));
  return safe.length > 0 ? `/records?${safe}` : "/records";
}
