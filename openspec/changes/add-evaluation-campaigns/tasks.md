# Tasks

## 1. Acceptance

- [ ] 1.1 A person accepts this revision, after the catalog increment, before campaign code is written. Verify `x-human-approval` is still `pending` here.

## 2. Campaigns, only after that acceptance

- [ ] 2.1 Verify CAMP-1 in the named wizard test, including keyboard focus on an empty name.
- [ ] 2.2 Verify CAMP-2, CAMP-3, and CAMP-4 with the named integration tests. Confirm the job does not call an external host.
- [ ] 2.3 Verify RES-1, RES-2, and RES-4 with the named integration tests, including Not run versus zero and another account as 404.
- [ ] 2.4 Verify RES-3 in the named web test: Back keeps the filter and focus returns to the case list on a narrow layout.
- [ ] 2.5 Map the new campaign components to CAMP and RES requirements and verify `pnpm check:spec-coverage`.

## Workflow follow-up

- Do not archive from the spec pull request.
