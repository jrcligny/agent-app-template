# Design

## Context

See proposal.md. The bootstrap app already has sessions, tokens, Button, TextField, Card, and Status. This change adds patterns, not a second visual system.

## Goals / Non-Goals

**Goals:**

- One record resource with synthetic fields: title, status, owner display name, summary, and body.
- Reuse tokens and the existing controls. Add DataTable, Drawer, and ConfirmDialog only because more than one screen needs them.
- Integration tests hit HTTP and a disposable local database. Component tests cover table empty and form validation states. One Playwright journey covers the happy path and the confirm dialog.

**Non-Goals:**

- Wizard, background jobs, activity history, and settings. See `add-workbench-operations`.
- Real organization data, SSO, or a new auth system.
- Implementing this change in the spec pull request.

## Decisions

- Records are owned by the signed-in account, same 404 rule as notes for another account.
- The table is server-paged. Search, status filter, and sort are query parameters so the tests can assert them without a browser.
- The drawer is a route state on the table page. The long body lives at `/records/:id`.
- Closed status requires a reason. The form asks before navigation when fields differ from the last save.
- Bulk delete and single delete both use ConfirmDialog.

## Risks / Trade-offs

- [Spec written before approval] → `x-human-approval` stays `pending`. Implementation waits for the merged spec commit.
- [Stacked on the bootstrap branch] → After that branch merges, retarget this pull request onto `main` and rebase. Do not merge it first.

## Migration Plan

A later implementation adds forward-only tables. No drop or truncate. Rollback is the app Deployment only, as in the bootstrap chart.

## Open Questions

None that change these requirements. The human review can still narrow the first slice.
