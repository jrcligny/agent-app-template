# Tasks

## 1. Acceptance

- [ ] 1.1 A person accepts this revision before any route or table is removed. Verify `x-human-approval` is still `pending`.

## 2. Removal, only after that acceptance

- [ ] 2.1 Replace the migration set as BACK-2 describes and verify MIG-2 still fails on DROP or TRUNCATE.
- [ ] 2.2 Verify BACK-1 and BACK-2 with the named integration tests.
- [ ] 2.3 Verify AUTH-3 and AUTH-4 against sign-out and GET /api/me, not notes.
- [ ] 2.4 Delete the demo routes and verify SURF-1 in the browser.
- [ ] 2.5 Delete the demo components listed in SB-3, update the coverage map, and verify `pnpm check:spec-coverage`.

## Workflow follow-up

- Do not archive from the spec pull request.
- Archive only after this increment is implemented, and do not archive `document-existing-components` in that step.
