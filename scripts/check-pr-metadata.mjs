const BOOTSTRAP_SENTENCE =
  "Bootstrap exception: the initiating request authorized the first spec and implementation together. There is no prior merged spec commit.";

const FORBIDDEN = [
  /human signoff:\s*approved/i,
  /review status:\s*approved/i,
  /agent approval:\s*approved/i,
  /self-approved/i,
];

export function evaluatePrBody(body, options = {}) {
  const problems = [];
  for (const pattern of FORBIDDEN) {
    if (pattern.test(body)) {
      problems.push("PR text must not record an approval status. Approval is a human GitHub review.");
    }
  }
  if (!/Author approval:\s*none/i.test(body)) {
    problems.push("Add `Author approval: none`. The author does not approve this PR.");
  }
  const implementation = /Review type:\s*implementation/i.test(body);
  const spec = /Review type:\s*spec/i.test(body);
  if (implementation === spec) {
    problems.push("Set exactly one of `Review type: implementation` or `Review type: spec`.");
  }
  if (spec) {
    if (!/Change:\s*[a-z0-9-]+/i.test(body)) problems.push("Spec PRs need `Change: <kebab-name>`.");
    if (!/Baseline update:\s*none/i.test(body)) {
      problems.push("Spec PRs must say `Baseline update: none` and must not archive into openspec/specs.");
    }
    if (!/Lenses:\s*spec/i.test(body)) problems.push("Spec PRs need `Lenses: spec`.");
  }
  if (implementation) {
    if (!/Lenses:\s*.*security.*architecture.*spec.*ui/is.test(body)) {
      problems.push("Implementation PRs need `Lenses: security, architecture, spec, ui`.");
    }
    const commit = body.match(/Approved spec commit:\s*([0-9a-f]{40}|none)/i);
    if (!commit) problems.push("Implementation PRs need `Approved spec commit:` as 40 hex characters or `none`.");
    if (commit?.[1] === "none" && !body.includes(BOOTSTRAP_SENTENCE)) {
      problems.push("Implementation PRs without an approved commit need the exact bootstrap sentence.");
    }
    if (commit?.[1] === "none" && options.baseHasImplementedSpecs) {
      problems.push("The bootstrap exception is closed because main already has an implemented spec baseline.");
    }
  }
  return {
    ok: problems.length === 0,
    problems,
    provesHumanApproval: false,
  };
}

export { BOOTSTRAP_SENTENCE };

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

if (process.argv[1]?.endsWith("check-pr-metadata.mjs")) {
  if (process.argv.includes("--self-test")) {
    const { spawnSync } = await import("node:child_process");
    const result = spawnSync(process.execPath, ["--test", "scripts/pr-metadata.test.mjs"], {
      stdio: "inherit",
    });
    process.exit(result.status ?? 1);
  }
  const body = process.env.PR_BODY ?? readArg("--body") ?? "";
  const baseHasImplementedSpecs = process.env.BASE_HAS_IMPLEMENTED_SPECS === "true";
  const result = evaluatePrBody(body, { baseHasImplementedSpecs });
  if (!result.ok) {
    console.error(result.problems.join("\n"));
    console.error("Metadata check failed. This check does not approve the PR and does not identify a reviewer.");
    process.exit(1);
  }
  console.log("PR metadata shape is valid. This is not a review approval and not a reviewer identity.");
}
