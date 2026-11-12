import assert from "node:assert/strict";
import test from "node:test";
import { coverageReport } from "./check-spec-coverage.mjs";

test("every discovered component maps to a real requirement", () => {
  const report = coverageReport();
  assert.deepEqual(report.problems, []);
  assert.ok(report.total > 20);
  assert.ok(report.pendingLinks > 0);
});
