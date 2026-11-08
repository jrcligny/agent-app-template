# Tasks

## 1. Spec review

- [x] 1.1 A human accepts this revision before any application code is written

Accepted by merging pull request 2 into this branch at `b25cc62a28ba3dd76b03b5adde1d2ba80346254c` (spec content `da77460141f18f1e6feadbb501f6b81cd8cccf8f`). `x-human-approval` stays `pending` because that field cannot name the person, the date, or a decision made outside a GitHub review. This note is not a GitHub review.

## 2. Implementation, only after that acceptance

- [x] 2.1 Add record HTTP endpoints and verify the integration tests named in the specs
- [x] 2.2 Add shared table, drawer, and confirm dialog and verify the component tests
- [x] 2.3 Add dashboard, table, detail, and form screens and verify the Playwright journey
- [x] 2.4 Archive this change only in the implementation pull request, after the tests pass

## Workflow follow-up

- Do not archive from the spec pull request.
- Do not start a later increment until this change is delivered and a human has accepted that later change on its own.
