import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const services = ["apps/api/src/auth/account.http.ts"];

const surfaces = [
  "apps/web/src/app.tsx",
  "apps/web/src/main.tsx",
  "apps/web/src/theme/theme.ts",
];

const infra = [
  "apps/api/Dockerfile",
  "apps/web/Dockerfile",
  "compose.yaml",
  "deploy/helm/agent-app/Chart.yaml",
  "deploy/helm/agent-app/templates/deployment-api.yaml",
  ".github/workflows/ci.yml",
  ".github/workflows/pages.yml",
  ".github/workflows/pr-metadata.yml",
  "scripts/check-skill-layout.mjs",
  "scripts/check-helm-scheduler.mjs",
  "scripts/check-spec-workflow.mjs",
  "scripts/check-deploy-policy.mjs",
  "scripts/check-import-boundaries.mjs",
  "scripts/check-pr-metadata.mjs",
  "scripts/check-spec-coverage.mjs",
  "scripts/check-english.mjs",
  "apps/docs/.vitepress/config.ts",
];

export function discoveredComponents(repoRoot = root) {
  const files = [
    ...walk(path.join(repoRoot, "apps/web/src/components")),
    ...walk(path.join(repoRoot, "apps/web/src/features")),
    ...walk(path.join(repoRoot, "apps/api/src")).filter((file) => file.endsWith(".http.ts")),
    ...services.map((file) => path.join(repoRoot, file)),
    ...surfaces.map((file) => path.join(repoRoot, file)),
    ...infra.map((file) => path.join(repoRoot, file)),
  ];
  return [...new Set(files.map((file) => path.relative(repoRoot, file).replaceAll("\\", "/")))].sort();
}

export function coverageReport(repoRoot = root) {
  const map = JSON.parse(readFileSync(path.join(repoRoot, "openspec/coverage.map.json"), "utf8"));
  const specs = specText(repoRoot);
  const discovered = discoveredComponents(repoRoot);
  const problems = [];
  let canonical = 0;
  let pending = 0;
  for (const file of discovered) {
    if (map.excluded?.[file]) continue;
    const requirements = map.components?.[file];
    if (!requirements?.length) {
      problems.push(`uncovered component ${file}`);
      continue;
    }
    for (const requirement of requirements) {
      const heading = `### Requirement: ${requirement}`;
      if (!specs.canonical.includes(heading) && !specs.pending.includes(heading)) {
        problems.push(`${file} cites missing requirement ${requirement}`);
      } else if (specs.canonical.includes(heading)) canonical += 1;
      else pending += 1;
    }
  }
  const known = new Set([...Object.keys(map.components ?? {}), ...Object.keys(map.excluded ?? {})]);
  for (const file of known) {
    if (!discovered.includes(file)) problems.push(`coverage map lists unknown file ${file}`);
  }
  return {
    total: discovered.length,
    excluded: Object.keys(map.excluded ?? {}).length,
    canonicalLinks: canonical,
    pendingLinks: pending,
    problems,
  };
}

function specText(repoRoot) {
  const canonical = readTree(path.join(repoRoot, "openspec/specs"));
  const pendingParts = [];
  const changes = path.join(repoRoot, "openspec/changes");
  for (const entry of readdirSync(changes, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "archive") continue;
    pendingParts.push(readTree(path.join(changes, entry.name, "specs")));
  }
  return { canonical, pending: pendingParts.join("\n") };
}

function readTree(directory) {
  if (!exists(directory)) return "";
  return walk(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

function walk(directory) {
  if (!exists(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (!entry.name.endsWith(".test.tsx") && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".stories.tsx")) {
      files.push(full);
    }
  }
  return files;
}

function exists(file) {
  try {
    statSync(file);
    return true;
  } catch {
    return false;
  }
}

if (process.argv[1]?.endsWith("check-spec-coverage.mjs")) {
  const report = coverageReport();
  console.log(
    `spec coverage: ${report.total} components, ${report.excluded} excluded, ${report.canonicalLinks} canonical links, ${report.pendingLinks} pending links`,
  );
  if (report.problems.length > 0) {
    console.error(report.problems.join("\n"));
    process.exit(1);
  }
}
