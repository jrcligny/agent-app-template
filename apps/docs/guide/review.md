# Review

Review instructions live in `.github/review`. They are plain Markdown for any person or assistant. CI does not launch a reviewer and does not mark a review approved.

Four lenses:

1. Security and data, including authorization, account isolation, secrets, migrations, and CI trust.
2. Architecture, including boundaries, dependency direction, duplication, and unnecessary abstraction.
3. Spec conformity, integration tests, regressions, breaking changes, and requirement traces.
4. UI, including shared components, keyboard, focus, and the relevant states.

Docker, Helm, probes, shutdown, resources, and rollback are reviewed inside the security and architecture lenses when those files change. The matrix is `.github/review/matrix.md`.

Spec pull requests are reviewed for risk, ambiguity, migration, and testability. Implementation pull requests are reviewed against the approved spec commit.

Findings name a file and line or a requirement id, plus severity, impact, evidence, and a fix. There is no quota. The author does not approve the pull request. An assistant run is advisory and is not a GitHub user.

Unresolved blocking findings fail a merge gate only after a human configures a ruleset that requires review. That integration is not configured. The metadata workflow only checks that the pull request body has the expected lines, and it says so in its log.
