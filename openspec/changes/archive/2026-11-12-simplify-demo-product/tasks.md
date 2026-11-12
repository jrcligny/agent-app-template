# Tasks

## 1. Acceptance

- [x] 1.1 A person accepts this revision before any route or table is removed. Verify `x-human-approval` is still `pending`.

jrcligny merged pull request 4 into `cursor/internal-app-template-c04e` at `3c8e914c5f3bb0e44b98c0edc002ed465e5ea745` on 2026-11-12T04:01:55Z, then asked in chat to implement the changes. `x-human-approval` stays `pending`. That field cannot name the person or record a decision made outside a GitHub review. This note is not a GitHub review. `document-existing-components` is not approved by that merge.

## 2. Removal, only after that acceptance

- [x] 2.1 Replace the migration set as BACK-2 describes and verify MIG-2 still fails on DROP or TRUNCATE.
- [x] 2.2 Verify BACK-1 and BACK-2 with the named integration tests.
- [x] 2.3 Verify AUTH-3 and AUTH-4 against sign-out and GET /api/me, not notes.
- [x] 2.4 Delete the demo routes and verify SURF-1 in the browser.
- [x] 2.5 Delete the demo components listed in SB-3, update the coverage map, and verify `pnpm check:spec-coverage`.

## Workflow follow-up

- Archive in the implementation pull request after the code matches.
- Do not archive `document-existing-components`.
