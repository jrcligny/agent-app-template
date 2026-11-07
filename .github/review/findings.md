# Findings

Write findings as comments on the pull request. Do not tick an approval box. Do not add a commit status that says the review passed.

```text
Lens: security
Severity: blocking
Location: NOTES-2
Impact: another account can read a note
Evidence: GET /api/notes/:id does not filter by user id
Fix: query by id and owner, and return 404 when the row is missing
```

Severity:

- `blocking` means the change should not merge until a human agrees it is fixed or explicitly accepted.
- `non-blocking` is a suggestion.

Handling:

1. The author fixes a blocking finding or explains why it is wrong, with evidence.
2. The reviewer confirms. The author does not confirm their own finding.
3. Merge is a separate human action.

CI does not fail on unanswered findings, because no trusted review app, runner identity, or ruleset is configured. Adding a generic "agent review" job would pretend that gate exists. Do not add one.

Files that encode this policy, and that an author must not weaken:

- `.github/review/**`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/PULL_REQUEST_TEMPLATE/**`
- `.github/workflows/**`
- `.github/CODEOWNERS`
- `scripts/check-pr-metadata.mjs`
- `scripts/check-import-boundaries.mjs`
- `scripts/check-deploy-policy.mjs`
- `scripts/check-spec-workflow.mjs`

CODEOWNERS names `@jrcligny` for these paths. That request is not enforcement until a human adds a ruleset.
