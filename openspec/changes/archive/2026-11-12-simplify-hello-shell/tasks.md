# Tasks

## 1. Acceptance

- [x] 1.1 A person accepts this revision before shell code changes. Verify `x-human-approval` is still `pending` and that this pull request contains no application code.

jrcligny merged pull request 4 into `cursor/internal-app-template-c04e` at `3c8e914c5f3bb0e44b98c0edc002ed465e5ea745` on 2026-11-12T04:01:55Z, then asked in chat to implement the changes. `x-human-approval` stays `pending`. That field cannot name the person or record a decision made outside a GitHub review. This note is not a GitHub review. `document-existing-components` is not approved by that merge.

## 2. Shell, only after that acceptance

- [x] 2.1 Render Hello world for a session and the account form otherwise, and verify the named HELLO-1 and HELLO-2 tests.
- [x] 2.2 Keep the theme menu and verify the named HELLO-3 browser test in light, dark, and a 375 pixel width.
- [x] 2.3 Remove dashboard and settings links from the header and verify the primary navigation does not list the removed sections.

## Workflow follow-up

- Archive in the implementation pull request after the code matches.
- Do not archive `document-existing-components`.
