# Tasks

## 1. Acceptance

- [ ] 1.1 A person accepts this revision, after the baseline increment, before monitoring code is written. Verify `x-human-approval` is still `pending` here.

## 2. Monitoring, only after that acceptance

- [ ] 2.1 Verify HOME-1 and HOME-2 in the named web tests, including a forbidden status that is not an empty list.
- [ ] 2.2 Verify ORG-1 and ORG-2 with the named integration tests, including the foreign-id rollback.
- [ ] 2.3 Verify ORG-3 in the named web test for keyboard focus on an empty tag.
- [ ] 2.4 Verify RATE-1, RATE-2, and RATE-3, including a running campaign omitted from the chart and an unordered window rejected.
- [ ] 2.5 Verify ACT-3 records a launch without copying a case score.
- [ ] 2.6 Map the home, chart, and organization screens to these requirements and verify `pnpm check:spec-coverage`.

## Workflow follow-up

- Do not archive from the spec pull request.
