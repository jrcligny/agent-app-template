import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DESTRUCTIVE =
  /\b(drop\s+table|drop\s+schema|drop\s+database|drop\s+column|truncate\s+table|truncate)\b/i;

export function findDestructiveSql(sql: string): string[] {
  return sql
    .split("\n")
    .map((line, index) => ({ line: stripSqlComment(line), number: index + 1 }))
    .filter(({ line }) => DESTRUCTIVE.test(line))
    .map(({ line, number }) => `line ${number}: ${line.trim()}`);
}

export function assertForwardOnlyMigrations(migrationsFolder: string): void {
  const files = readdirSync(migrationsFolder).filter((file) => file.endsWith(".sql")).sort();
  const problems: string[] = [];
  for (const file of files) {
    const sql = readFileSync(path.join(migrationsFolder, file), "utf8");
    for (const hit of findDestructiveSql(sql)) {
      problems.push(`${file} ${hit}`);
    }
  }
  if (problems.length > 0) {
    throw new Error(
      `Refusing destructive SQL. Migrations are forward-only.\n${problems.join("\n")}`,
    );
  }
}

function stripSqlComment(line: string): string {
  const marker = line.indexOf("--");
  return marker === -1 ? line : line.slice(0, marker);
}
