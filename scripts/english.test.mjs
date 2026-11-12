import assert from "node:assert/strict";
import test from "node:test";
import { englishProblems } from "./check-english.mjs";

test("source, docs, and seeds stay in English", () => {
  assert.deepEqual(englishProblems(), []);
});
