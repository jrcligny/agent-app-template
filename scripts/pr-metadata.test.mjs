import test from "node:test";
import assert from "node:assert/strict";
import { BOOTSTRAP_SENTENCE, evaluatePrBody } from "./check-pr-metadata.mjs";

const implementation = `Review type: implementation
Lenses: security, architecture, spec, ui
Approved spec commit: ${"abc".repeat(13).slice(0, 40)}
Author approval: none
`;

test("an implementation body is metadata only", () => {
  const result = evaluatePrBody(implementation, { baseHasImplementedSpecs: true });
  assert.equal(result.ok, true);
  assert.equal(result.provesHumanApproval, false);
});

test("a recorded approval status is rejected", () => {
  const result = evaluatePrBody(`${implementation}\nReview status: approved\n`);
  assert.equal(result.ok, false);
});

test("the bootstrap sentence is refused once a baseline exists", () => {
  const body = `Review type: implementation
Lenses: security, architecture, spec, ui
Approved spec commit: none
Author approval: none
${BOOTSTRAP_SENTENCE}
`;
  assert.equal(evaluatePrBody(body, { baseHasImplementedSpecs: false }).ok, true);
  assert.equal(evaluatePrBody(body, { baseHasImplementedSpecs: true }).ok, false);
});

test("a spec body must not claim a baseline update", () => {
  const body = `Review type: spec
Change: add-export
Baseline update: none
Lenses: spec
Author approval: none
`;
  assert.equal(evaluatePrBody(body).ok, true);
  assert.equal(evaluatePrBody(body.replace("none", "updated specs")).ok, false);
});
