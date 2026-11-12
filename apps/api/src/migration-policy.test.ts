import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { migrationsFolder } from "./migrate.js";
import { assertForwardOnlyMigrations, findDestructiveSql } from "./migration-policy.js";

describe("migration policy", () => {
  it("MIG-2 rejects destructive SQL", () => {
    expect(findDestructiveSql("CREATE TABLE note (id uuid);")).toEqual([]);
    expect(findDestructiveSql("DROP TABLE note;").length).toBeGreaterThan(0);
    expect(findDestructiveSql("TRUNCATE note;").length).toBeGreaterThan(0);
    expect(findDestructiveSql("ALTER TABLE note DROP COLUMN title;").length).toBeGreaterThan(0);

    const folder = mkdtempSync(path.join(tmpdir(), "migrations-"));
    writeFileSync(path.join(folder, "0001_drop.sql"), "DROP TABLE note;\n");
    expect(() => assertForwardOnlyMigrations(folder)).toThrow(/destructive/i);
  });

  it("MIG-2 accepts the committed forward-only migrations", () => {
    expect(() => assertForwardOnlyMigrations(migrationsFolder())).not.toThrow();
  });

});
