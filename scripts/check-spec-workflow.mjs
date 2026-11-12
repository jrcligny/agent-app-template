import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const uiWords = ["loading", "empty", "error", "success", "validation", "permission", "keyboard", "focus", "narrow"];

export function hashChangeSpecs(changeDir) {
  const files = [];
  const proposal = path.join(changeDir, "proposal.md");
  if (exists(proposal)) files.push(proposal);
  files.push(...walk(path.join(changeDir, "specs")).filter((file) => file.endsWith(".md")));
  files.sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(path.relative(changeDir, file).replaceAll("\\", "/"));
    hash.update("\n");
    hash.update(readFileSync(file));
    hash.update("\n");
  }
  return `sha256:${hash.digest("hex")}`;
}

export function reviewChange(changeDir) {
  const metadata = readMetadata(path.join(changeDir, ".openspec.yaml"));
  const revision = hashChangeSpecs(changeDir);
  const problems = [];
  if (metadata["x-spec-revision"] !== revision) {
    problems.push(`x-spec-revision does not match the proposal and delta specs (${revision})`);
  }
  const approval = metadata["x-human-approval"] ?? "pending";
  if (["agent-approved", "self-approved", "auto-approved"].includes(approval)) {
    problems.push("agent self-approval is not human approval");
  } else if (approval === "approved") {
    if (metadata["x-approved-revision"] !== revision) {
      problems.push("approval invalidated: spec revision changed");
    }
    if (!/^[0-9a-f]{40}$/.test(metadata["x-approved-commit"] ?? "")) {
      problems.push("approved changes need a 40-character commit id");
    }
  } else if (approval !== "pending") {
    problems.push(`unsupported x-human-approval value: ${approval}`);
  }
  const proposal = readIfExists(path.join(changeDir, "proposal.md"));
  if (!proposal.includes("## User journey")) {
    problems.push("proposal.md needs a User journey section");
  }
  if (metadata["x-ui"] === "true") {
    const specs = walk(path.join(changeDir, "specs"))
      .filter((file) => file.endsWith(".md"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n")
      .toLowerCase();
    for (const word of uiWords) {
      if (!specs.includes(word)) problems.push(`UI change is missing acceptance coverage for "${word}"`);
    }
  }
  return {
    revision,
    approval,
    provesHumanApproval: false,
    problems,
  };
}

export function writeRevision(changeDir) {
  const revision = hashChangeSpecs(changeDir);
  const file = path.join(changeDir, ".openspec.yaml");
  const text = readIfExists(file);
  const next = text.includes("x-spec-revision:")
    ? text.replace(/x-spec-revision:\s*\S+/, `x-spec-revision: ${revision}`)
    : `${text.trimEnd()}\nx-spec-revision: ${revision}\n`;
  writeFileSync(file, next.endsWith("\n") ? next : `${next}\n`);
  return revision;
}

function readMetadata(file) {
  const data = {};
  for (const line of readIfExists(file).split("\n")) {
    const match = line.match(/^([A-Za-z0-9-]+):\s*(.*)$/);
    if (match) data[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return data;
}

function readIfExists(file) {
  return exists(file) ? readFileSync(file, "utf8") : "";
}

function exists(file) {
  try {
    statSync(file);
    return true;
  } catch {
    return false;
  }
}

function walk(directory) {
  if (!exists(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function changeDirectories() {
  const changes = path.join(root, "openspec/changes");
  return walk(changes)
    .filter((file) => file.endsWith(`${path.sep}.openspec.yaml`) || file.endsWith("/.openspec.yaml"))
    .map((file) => path.dirname(file));
}

if (process.argv[1]?.endsWith("check-spec-workflow.mjs")) {
  const write = process.argv.includes("--write");
  const directories = changeDirectories();
  if (directories.length === 0) {
    console.error("no OpenSpec changes found");
    process.exit(1);
  }
  let failed = false;
  for (const directory of directories) {
    if (write) writeRevision(directory);
    const result = reviewChange(directory);
    const name = path.relative(path.join(root, "openspec/changes"), directory);
    if (result.problems.length > 0) {
      failed = true;
      console.error(`${name}\n${result.problems.map((problem) => `  ${problem}`).join("\n")}`);
    } else {
      console.log(
        `${name}: revision ${result.revision} recorded as ${result.approval}. This does not prove a human approved it.`,
      );
    }
  }
  if (failed) process.exit(1);
}
