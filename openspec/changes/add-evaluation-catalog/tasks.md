# Tasks

## 1. Acceptance

- [ ] 1.1 A person accepts this revision before catalog code is written. Verify `x-human-approval` is still `pending` in this spec pull request and that no implementation files changed with it.

## 2. Catalog, only after that acceptance

- [ ] 2.1 Add agent and suite tables with forward-only SQL and verify the migration policy still rejects a drop.
- [ ] 2.2 Verify AGT-1, AGT-2, AGT-3, and AGT-4 with the named integration tests on a disposable database.
- [ ] 2.3 Verify SUI-1, SUI-2, SUI-3, and SUI-4 with the named integration tests.
- [ ] 2.4 Verify DEMO-1 loads the English catalog and makes no external call.
- [ ] 2.5 Verify EVAL-1 and AGT-5 in the named web and browser tests, including the narrow header.
- [ ] 2.6 Point the new screens at these requirement ids in the coverage map and verify `pnpm check:spec-coverage` passes.

## Workflow follow-up

- Do not archive from the spec pull request.
- Leave `document-existing-components` pending.
