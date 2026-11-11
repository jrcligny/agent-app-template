# Tasks

## 1. Acceptance

- [ ] 1.1 A person accepts this revision before story files change. Verify `x-human-approval` is still `pending`.

## 2. Catalog, only after that acceptance

- [ ] 2.1 Add or keep the stories named in SB-1 and verify each docs page links a requirement id without copying the spec.
- [ ] 2.2 Verify SB-2: the toolbar Dark choice leaves the canvas dark.
- [ ] 2.3 Remove the stories named in SB-3 when the demo components are deleted, and verify the Storybook index no longer lists them.
- [ ] 2.4 Verify PAT-1, PAT-2, and PAT-3 against sample rows only, with no record request.
- [ ] 2.5 Update the coverage map for files that remain or disappear and verify `pnpm check:spec-coverage`.

## Workflow follow-up

- Do not archive from the spec pull request.
