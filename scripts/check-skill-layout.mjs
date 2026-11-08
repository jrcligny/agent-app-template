import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const canonicalRoot = path.join(root, ".agents", "skills");
const required = [
  "openspec-apply-change",
  "openspec-archive-change",
  "openspec-explore",
  "openspec-propose",
  "openspec-sync-specs",
  "openspec-update-change",
];
const duplicateRoots = [
  ".cursor/skills",
  ".cursor/commands",
  ".github/skills",
  ".github/prompts",
];
const problems = [];

for (const name of required) {
  const file = path.join(canonicalRoot, name, "SKILL.md");
  if (!isFile(file)) {
    problems.push(`missing canonical skill ${path.relative(root, file)}`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  if (!text.startsWith("---\n")) problems.push(`${name}: SKILL.md has no YAML frontmatter`);
  if (!text.includes("license: MIT")) problems.push(`${name}: missing MIT license attribution`);
  if (!text.includes('generatedBy: "1.16.1"')) {
    problems.push(`${name}: expected OpenSpec generatedBy 1.16.1 attribution`);
  }
}

const marker = path.join(canonicalRoot, ".openspec-target");
if (!isFile(marker) || readFileSync(marker, "utf8").trim() !== "agents") {
  problems.push(".agents/skills/.openspec-target must contain agents");
}

for (const relative of duplicateRoots) {
  const full = path.join(root, relative);
  if (isFile(full) || (exists(full) && listFiles(full).length > 0)) {
    problems.push(`remove generated duplicate path ${relative}`);
  }
}

for (const file of listFiles(root)) {
  if (!file.endsWith(`${path.sep}SKILL.md`) && !file.endsWith("/SKILL.md")) continue;
  const relative = path.relative(root, file);
  if (relative.startsWith(`.agents${path.sep}skills${path.sep}`)) continue;
  if (relative.split(path.sep).includes("node_modules")) continue;
  problems.push(`SKILL.md outside .agents/skills: ${relative}`);
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`canonical skills ok (${required.length} OpenSpec skills in .agents/skills)`);

function exists(file) {
  try {
    statSync(file);
    return true;
  } catch {
    return false;
  }
}

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

function listFiles(directory) {
  if (!exists(directory)) return [];
  const skip = new Set(["node_modules", "dist", ".git", "storybook-static"]);
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else files.push(full);
  }
  return files;
}
