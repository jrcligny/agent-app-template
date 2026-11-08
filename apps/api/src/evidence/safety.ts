const allowedMediaTypes = new Set(["text/plain", "image/png", "image/jpeg"]);
export const maxArtifactBytes = 256 * 1024;

export class EvidenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceValidationError";
  }
}

export function assertSameOriginPath(value: string): string {
  const path = value.trim();
  const lower = path.toLowerCase().replace(/\s+/g, "");
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes("://") ||
    lower.includes("javascript:") ||
    lower.includes("data:") ||
    path.split("/").includes("..") ||
    hasControl(path)
  ) {
    throw new EvidenceValidationError("Links must be same-origin paths.");
  }
  return path;
}

export function assertMediaType(value: string): string {
  const mediaType = value.trim().toLowerCase();
  if (!allowedMediaTypes.has(mediaType)) {
    throw new EvidenceValidationError("Use a plain-text log or a PNG or JPEG image.");
  }
  return mediaType;
}

export function safeFileName(value: string): string {
  const base = value.split(/[/\\]/).pop() ?? "file";
  const cleaned = base.replace(/[^\w.\- ]+/g, "").trim().slice(0, 80);
  return cleaned.length > 0 ? cleaned : "file";
}

export function decodeArtifact(contentBase64: string, mediaType: string): Uint8Array {
  const bytes = Uint8Array.from(Buffer.from(contentBase64, "base64"));
  if (bytes.byteLength === 0 || bytes.byteLength > maxArtifactBytes) {
    throw new EvidenceValidationError("The file is empty or larger than the demo limit.");
  }
  if (mediaType === "image/png" && !hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47])) {
    throw new EvidenceValidationError("The file is not a PNG.");
  }
  if (mediaType === "image/jpeg" && !hasPrefix(bytes, [0xff, 0xd8, 0xff])) {
    throw new EvidenceValidationError("The file is not a JPEG.");
  }
  if (mediaType === "text/plain" && bytes.includes(0)) {
    throw new EvidenceValidationError("A log must be plain text.");
  }
  return bytes;
}

function hasControl(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code <= 31) return true;
  }
  return false;
}

function hasPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}
