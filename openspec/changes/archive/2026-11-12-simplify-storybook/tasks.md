# Tasks

## 1. Acceptance

- [x] 1.1 A person accepts this revision before story files change. Verify `x-human-approval` is still `pending`.

jrcligny merged pull request 4 into `cursor/internal-app-template-c04e` at `3c8e914c5f3bb0e44b98c0edc002ed465e5ea745` on 2026-11-12T04:01:55Z, then asked in chat to implement the changes. `x-human-approval` stays `pending`. That field cannot name the person or record a decision made outside a GitHub review. This note is not a GitHub review. `document-existing-components` is not approved by that merge.

## 2. Catalog, only after that acceptance

- [x] 2.1 Add or keep the stories named in SB-1 and verify each docs page links a requirement id without copying the spec.
- [x] 2.2 Verify SB-2: the toolbar Dark choice leaves the canvas dark.
- [x] 2.3 Remove the stories named in SB-3 when the demo components are deleted, and verify the Storybook index no longer lists them.
- [x] 2.4 Verify PAT-1, PAT-2, and PAT-3 against sample rows only, with no record request.
- [x] 2.5 Update the coverage map for files that remain or disappear and verify `pnpm check:spec-coverage`.

## Workflow follow-up

- Archive in the implementation pull request after the code matches.
- Do not archive `document-existing-components`.
