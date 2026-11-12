const REDACTED = new Set([
  "password",
  "authorization",
  "cookie",
  "authsecret",
  "databaseurl",
  "token",
  "secret",
]);

export function logInfo(message: string, fields?: Record<string, unknown>): void {
  console.log(JSON.stringify({ level: "info", message, ...redact(fields) }));
}

export function logError(message: string, fields?: Record<string, unknown>): void {
  console.error(JSON.stringify({ level: "error", message, ...redact(fields) }));
}

function redact(fields: Record<string, unknown> | undefined): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    safe[key] = REDACTED.has(key.toLowerCase()) ? "[redacted]" : value;
  }
  return safe;
}
