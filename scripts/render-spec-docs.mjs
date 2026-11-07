import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "apps/docs/generated");
rmSync(output, { recursive: true, force: true });
mkdirSync(path.join(output, "specs"), { recursive: true });
mkdirSync(path.join(output, "changes"), { recursive: true });

const specs = listMarkdown(path.join(root, "openspec/specs"));
const changes = listMarkdown(path.join(root, "openspec/changes"));

writeFileSync(
  path.join(output, "index.md"),
  `# Specifications

These pages are generated from \`openspec/\` when the docs are built. Edit the source files, not this folder.

| Status | Meaning |
| --- | --- |
| Proposed | An active change under \`openspec/changes/\`. Merging a spec pull request leaves it here and does not change the implemented baseline. |
| Implemented baseline | \`openspec/specs/\` after a delivered change is archived. This describes the code on the branch. It is not a release. |
| Released | A git tag a human publishes. No release tag is part of this template. Nothing here has been deployed. |

GitHub Pages for this repository is not live until a human selects GitHub Actions as the Pages source.
`,
);

const specIndex = ["# Implemented baseline", ""];
if (specs.length === 0) specIndex.push("No implemented baseline has been archived yet.");
for (const file of specs) {
  const name = path.basename(path.dirname(file));
  const body = readFileSync(file, "utf8");
  specIndex.push(`- [${name}](./specs/${name})`);
  writeFileSync(
    path.join(output, "specs", `${name}.md`),
    banner("Implemented baseline", path.relative(root, file)) + body,
  );
}
writeFileSync(path.join(output, "specs.md"), `${specIndex.join("\n")}\n`);

const changeIndex = ["# Changes", ""];
if (changes.length === 0) changeIndex.push("No change files are present.");
for (const file of changes) {
  const relative = path.relative(path.join(root, "openspec/changes"), file);
  const proposed = !relative.startsWith(`archive${path.sep}`) && !relative.startsWith("archive/");
  const title = relative.replaceAll(path.sep, "/");
  const page = title.replaceAll("/", "-").replace(/\.md$/, "");
  changeIndex.push(`- ${proposed ? "Proposed" : "Archived history"}: [${title}](./changes/${page})`);
  writeFileSync(
    path.join(output, "changes", `${page}.md`),
    banner(
      proposed
        ? "Proposed. This is not the implemented baseline."
        : "Archived history of a delivered change. Archive is not a release and not a deploy.",
      path.join("openspec/changes", relative),
    ) + readFileSync(file, "utf8"),
  );
}
writeFileSync(path.join(output, "changes.md"), `${changeIndex.join("\n")}\n`);

function banner(status, source) {
  return `<!-- generated from ${source} -->\n\n> **Status:** ${status}\n>\n> **Source:** \`${source.split(path.sep).join("/")}\`\n>\n> **Released/deployed baseline:** none.\n\n`;
}

function listMarkdown(directory) {
  if (!exists(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listMarkdown(full));
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files.sort();
}

function exists(file) {
  try {
    statSync(file);
    return true;
  } catch {
    return false;
  }
}

console.log(`rendered spec pages to ${path.relative(root, output)}`);
