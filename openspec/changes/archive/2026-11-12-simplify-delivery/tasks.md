# Tasks

## 1. Acceptance

- [x] 1.1 A person accepts this revision before the chart or the workflows change. Verify `x-human-approval` is still `pending`.

jrcligny merged pull request 4 into `cursor/internal-app-template-c04e` at `3c8e914c5f3bb0e44b98c0edc002ed465e5ea745` on 2026-11-12T04:01:55Z, then asked in chat to implement the changes. `x-human-approval` stays `pending`. That field cannot name the person or record a decision made outside a GitHub review. This note is not a GitHub review. `document-existing-components` is not approved by that merge.

## 2. Delivery, only after that acceptance

- [x] 2.1 Remove the scheduler and verify DEL-2 renders two API replicas and, when autoscaling is enabled, a HorizontalPodAutoscaler, without a template failure.
- [x] 2.2 Verify DEL-1: both images build as non-root and the image job does not push.
- [x] 2.3 Verify DEL-3 and DEL-4 still run in CI, including the Storybook artifact and the Pages workflow.
- [x] 2.4 Update the docs to the hello page and the auth schema, and verify the docs build.

## Workflow follow-up

- Archive in the implementation pull request after the code matches.
- Do not archive `document-existing-components`.
