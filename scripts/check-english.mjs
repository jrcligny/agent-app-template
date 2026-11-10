import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const skipDirs = new Set([".git", "node_modules", "dist", "storybook-static", "coverage", "test-results"]);
const extensions = new Set([".ts", ".tsx", ".mjs", ".md", ".yml", ".yaml", ".json", ".sql", ".html", ".css"]);
const words = readFileSync(path.join(root, "scripts/english-wordlist.txt"), "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const accent = /[\u00e0\u00e2\u00e4\u00e9\u00e8\u00ea\u00eb\u00ef\u00ee\u00f4\u00f9\u00fb\u00fc\u00e7\u0153\u00c0\u00c2\u00c9\u00c8\u00ca\u00cb\u00cf\u00ce\u00d4\u00d9\u00db\u00dc\u00c7]/;

export function englishProblems(repoRoot = root) {
  const allow = new Set(
    readFileSync(path.join(repoRoot, "scripts/english-allowlist.txt"), "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#")),
  );
  const problems = [];
  for (const file of walk(repoRoot)) {
    const relative = path.relative(repoRoot, file);
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      if ([...allow].some((entry) => line.includes(entry))) return;
      const lower = line.toLowerCase();
      const word = words.find((item) => new RegExp(`\\b${item}\\b`, "i").test(lower));
      if (accent.test(line) || word) {
        problems.push(`${relative}:${index + 1} ${word ?? "accented character"}`);
      }
    });
  }
  return problems;
}

function walk(directory) {
  if (!statSync(directory).isDirectory()) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (skipDirs.has(entry.name) || entry.name === "english-wordlist.txt") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (extensions.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

if (process.argv[1]?.endsWith("check-english.mjs")) {
  const problems = englishProblems();
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("English copy check passed");
}
