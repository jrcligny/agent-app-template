import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".mjs"]);
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

export function checkRepository(repoRoot = root) {
  const files = walk(repoRoot).filter((file) => sourceExtensions.has(path.extname(file)));
  const findings = [];
  const graphs = new Map();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const specifiers = [...text.matchAll(importPattern)]
      .map((match) => match[1] ?? match[2])
      .filter(Boolean);
    findings.push(...boundaryFindings(repoRoot, file, text, specifiers));
    const relative = normalize(repoRoot, file);
    const bucket = bucketFor(relative);
    if (!bucket) continue;
    if (!graphs.has(bucket)) graphs.set(bucket, new Map());
    graphs.get(bucket).set(relative, resolveInternal(repoRoot, file, specifiers, bucket));
  }
  for (const [bucket, graph] of graphs) {
    findings.push(...cycles(bucket, graph));
  }
  return findings;
}

function boundaryFindings(repoRoot, file, text, specifiers) {
  const relative = normalize(repoRoot, file);
  const findings = [];
  if (relative.startsWith("apps/web/")) {
    if (/AUTH_SECRET|DATABASE_URL|local-dev-only|ci-only-secret/.test(text)) {
      findings.push(`${relative}: web source must not contain server secrets or local database URLs`);
    }
  }
  for (const specifier of specifiers) {
    const resolved = resolveSpecifier(repoRoot, file, specifier);
    if (relative.startsWith("apps/web/")) {
      if (isServerImport(specifier, resolved, repoRoot)) {
        findings.push(`${relative}: web cannot import server code (${specifier})`);
      }
      if (relative.includes("/components/") && resolved.includes("/features/")) {
        findings.push(`${relative}: shared components cannot import feature modules (${specifier})`);
      }
      const feature = featureName(relative);
      const other = featureName(resolved);
      if (feature && other && feature !== other) {
        findings.push(`${relative}: feature "${feature}" cannot import feature "${other}"`);
      }
    }
    if (relative.startsWith("packages/contracts/")) {
      if (!(specifier.startsWith(".") || specifier === "zod")) {
        findings.push(`${relative}: contracts may import only zod and relative files (${specifier})`);
      }
    }
    if (relative.startsWith("apps/api/") && relative.endsWith(".http.ts")) {
      const typeOnly = isTypeOnlyImport(text, specifier);
      const databaseType = typeOnly && specifier.includes("/db/types");
      if (!databaseType && (specifier === "drizzle-orm" || specifier.startsWith("drizzle-orm/") || resolved.includes("/db/"))) {
        findings.push(`${relative}: HTTP routes stay thin and cannot import the database (${specifier})`);
      }
    }
    if (relative === "apps/api/src/index.ts" && specifier.includes("migrate")) {
      findings.push(`${relative}: the API process must not import the migrator`);
    }
    if (relative.startsWith("apps/api/src/features/")) {
      const feature = featureName(relative);
      const other = featureName(resolved);
      if (feature && other && feature !== other) {
        findings.push(`${relative}: feature "${feature}" cannot import feature "${other}"`);
      }
    }
  }
  if (relative.startsWith("apps/api/") && /origin:\s*["']\*["']|hono\/cors/.test(text)) {
    findings.push(`${relative}: do not enable wildcard CORS; the API is same-origin`);
  }
  return findings;
}

function isTypeOnlyImport(text, specifier) {
  const lines = text.split("\n").filter((line) => line.includes(specifier));
  return lines.length > 0 && lines.every((line) => /^\s*import\s+type\b/.test(line));
}

function isServerImport(specifier, resolved, repoRoot) {
  if (specifier === "better-auth/react" || specifier === "better-auth/client") return false;
  if (
    specifier === "pg" ||
    specifier === "drizzle-orm" ||
    specifier.startsWith("drizzle-orm/") ||
    specifier === "@agent-app/api" ||
    specifier.startsWith("@agent-app/api/") ||
    specifier === "better-auth" ||
    specifier.startsWith("better-auth/")
  ) {
    return true;
  }
  const apiRoot = normalize(repoRoot, path.join(repoRoot, "apps/api"));
  return resolved.startsWith(`${apiRoot}/`) || resolved.includes("/apps/api/");
}

function featureName(file) {
  const match = file.match(/\/features\/([^/]+)\//);
  return match?.[1] ?? null;
}

function resolveInternal(repoRoot, file, specifiers, bucket) {
  return specifiers
    .filter((specifier) => specifier.startsWith("."))
    .map((specifier) => resolveSpecifier(repoRoot, file, specifier))
    .map((resolved) => normalize(repoRoot, resolved))
    .filter((resolved) => resolved.startsWith(bucket));
}

function resolveSpecifier(repoRoot, file, specifier) {
  if (!specifier.startsWith(".")) return specifier;
  const base = path.resolve(path.dirname(file), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, "index.ts")];
  for (const candidate of candidates) {
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      // try the next suffix
    }
  }
  return base;
}

function cycles(bucket, graph) {
  const findings = [];
  const color = new Map();
  function visit(node, stack) {
    color.set(node, "gray");
    for (const next of graph.get(node) ?? []) {
      if (!graph.has(next)) continue;
      if (color.get(next) === "gray") {
        findings.push(`${bucket}: circular import involving ${next}`);
      } else if (color.get(next) !== "black") {
        visit(next, stack);
      }
    }
    color.set(node, "black");
  }
  for (const node of graph.keys()) {
    if (!color.has(node)) visit(node, []);
  }
  return findings;
}

function bucketFor(relative) {
  if (relative.startsWith("apps/api/src/")) return "apps/api/src/";
  if (relative.startsWith("apps/web/src/")) return "apps/web/src/";
  if (relative.startsWith("packages/contracts/src/")) return "packages/contracts/src/";
  return null;
}

function walk(directory) {
  if (directory.includes(`${path.sep}node_modules${path.sep}`) || directory.endsWith(`${path.sep}dist`)) {
    return [];
  }
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "generated") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function normalize(repoRoot, file) {
  return path.relative(repoRoot, file).split(path.sep).join("/");
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("check-import-boundaries.mjs")) {
  const findings = checkRepository(root);
  if (findings.length > 0) {
    console.error(findings.join("\n"));
    process.exit(1);
  }
  console.log(`import boundaries ok (${root})`);
}
