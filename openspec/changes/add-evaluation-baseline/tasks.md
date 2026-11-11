# Tasks

## 1. Acceptance

- [ ] 1.1 A person accepts this revision, after the campaign increment, before baseline code is written. Verify `x-human-approval` is still `pending` here.

## 2. Baseline, only after that acceptance

- [ ] 2.1 Verify BASE-1, BASE-2, and BASE-3 with the named integration tests, including the Harbor refund and the Field notes promotion.
- [ ] 2.2 Verify the promotion request does not call a pipeline or a deploy endpoint.
- [ ] 2.3 Verify BASE-4 in the named web test: focus returns from the confirm dialog and a narrow viewport keeps the table.
- [ ] 2.4 Map the comparison screen to BASE requirements and verify `pnpm check:spec-coverage`.

## Workflow follow-up

- Do not archive from the spec pull request.
