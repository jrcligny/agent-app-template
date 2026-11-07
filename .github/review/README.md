# Review guide

Reviews are done by a person, or by a separate assistant a person starts. This repository does not run a review bot, does not call a model from CI, and does not record a passing review status.

The author of a pull request does not approve it. An assistant that wrote the change is not an independent reviewer. A later assistant run is still advisory: it is not a GitHub reviewer identity, and it is not proof of security or of independence.

## What to read

1. The diff and the behavior it changes.
2. For a spec pull request, the proposal and delta specs.
3. For an implementation pull request, the approved spec commit named in the body, then the code and tests.
4. The lens prompts in `prompts/` that the matrix selects.

Do not review only by file extension. A markdown spec that changes who can read a note is a security review. A TypeScript change that moves a button is a UI review.

## Findings

Each finding has:

- lens
- severity: `blocking` or `non-blocking`
- location: `file:line` or a requirement id such as `NOTES-2`
- impact
- evidence from the diff or a run
- a concrete fix

No quota. No invented findings. Do not expand the review into unrelated edits.

## What happens next

The author answers or fixes blocking findings. The author still does not approve. A human merges.

Unresolved blocking findings stop a merge only when a human has configured a ruleset that requires review. That ruleset is not configured in this template. CI checks text shape, specs, tests, and policy files. Those checks do not approve anything.

See [matrix.md](matrix.md) and [findings.md](findings.md).
