import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { checkRepository } from "./check-import-boundaries.mjs";

test("flags a web import of the API and accepts a local component import", () => {
  const repo = mkdtempSync(path.join(tmpdir(), "boundaries-"));
  mkdirSync(path.join(repo, "apps/web/src"), { recursive: true });
  mkdirSync(path.join(repo, "apps/api/src"), { recursive: true });
  writeFileSync(path.join(repo, "apps/api/src/index.ts"), "export const server = true;\n");
  writeFileSync(
    path.join(repo, "apps/web/src/bad.ts"),
    'import { server } from "../../../apps/api/src/index.ts";\nconst secret = "AUTH_SECRET";\n',
  );
  writeFileSync(
    path.join(repo, "apps/web/src/ok.ts"),
    'import { cn } from "./cn";\nexport const label = "Notes";\n',
  );
  writeFileSync(path.join(repo, "apps/web/src/cn.ts"), "export function cn() { return \"\"; }\n");
  const findings = checkRepository(repo);
  assert.ok(findings.some((finding) => finding.includes("cannot import server code")));
  assert.ok(findings.some((finding) => finding.includes("AUTH_SECRET")));
  assert.equal(findings.some((finding) => finding.includes("ok.ts")), false);
});
