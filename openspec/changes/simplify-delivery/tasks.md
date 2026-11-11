# Tasks

## 1. Acceptance

- [ ] 1.1 A person accepts this revision before the chart or the workflows change. Verify `x-human-approval` is still `pending`.

## 2. Delivery, only after that acceptance

- [ ] 2.1 Remove the scheduler and verify DEL-2 renders two API replicas without a template failure.
- [ ] 2.2 Verify DEL-1: both images build as non-root and the image job does not push.
- [ ] 2.3 Verify DEL-3 and DEL-4 still run in CI, including the Storybook artifact and the Pages workflow.
- [ ] 2.4 Update the docs to the hello page and the auth schema, and verify the docs build.

## Workflow follow-up

- Do not archive from the spec pull request.
- Do not archive `document-existing-components` with this increment.
