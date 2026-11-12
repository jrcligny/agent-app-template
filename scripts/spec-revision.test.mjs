import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { hashChangeSpecs, reviewChange, writeRevision } from "./check-spec-workflow.mjs";

function fixture() {
  const dir = mkdtempSync(path.join(tmpdir(), "spec-"));
  mkdirSync(path.join(dir, "specs/notes"), { recursive: true });
  writeFileSync(path.join(dir, "proposal.md"), "# Proposal\n\n## User journey\n\nA person adds a note.\n");
  writeFileSync(
    path.join(dir, "specs/notes/spec.md"),
    "## ADDED Requirements\n\nloading empty error success validation permission keyboard focus narrow\n",
  );
  writeFileSync(path.join(dir, ".openspec.yaml"), "schema: spec-driven\nx-human-approval: pending\nx-ui: true\n");
  return dir;
}

test("a pending revision is consistent and does not prove human approval", () => {
  const dir = fixture();
  writeRevision(dir);
  const result = reviewChange(dir);
  assert.equal(result.problems.length, 0);
  assert.equal(result.provesHumanApproval, false);
  assert.equal(result.approval, "pending");
});

test("agent self-approval is rejected", () => {
  const dir = fixture();
  writeFileSync(path.join(dir, ".openspec.yaml"), "schema: spec-driven\nx-human-approval: agent-approved\n");
  writeRevision(dir);
  const result = reviewChange(dir);
  assert.ok(result.problems.some((problem) => problem.includes("self-approval")));
});

test("an approved record is invalidated when the spec changes", () => {
  const dir = fixture();
  const revision = hashChangeSpecs(dir);
  writeFileSync(
    path.join(dir, ".openspec.yaml"),
    `schema: spec-driven\nx-human-approval: approved\nx-spec-revision: ${revision}\nx-approved-revision: ${revision}\nx-approved-commit: ${"a".repeat(40)}\nx-ui: true\n`,
  );
  assert.equal(reviewChange(dir).problems.length, 0);
  assert.equal(reviewChange(dir).provesHumanApproval, false);
  writeFileSync(path.join(dir, "specs/notes/spec.md"), "changed acceptance criteria\n");
  assert.ok(reviewChange(dir).problems.some((problem) => problem.includes("invalidated")));
});
