# Proposal

## Why

The hello page and Storybook do not by themselves remove the demo backend. Records, collections, jobs, snapshots, analytics, and the rest still have routes and tables. This change specifies that removal and the backend that remains: better-auth, health, and a minimal schema. It does not delete code.

## What Changes

- Remove the demo HTTP routes and the screens that call them.
- Keep `GET /api/health`, `GET /api/health/ready`, better-auth, and `GET /api/me`.
- Replace the migration set with one initial migration for user, session, account, and verification. No DROP or TRUNCATE statement. A fresh database is required.
- Remove note, record, and campaign-style requirements from the baseline when this change is later archived.
- Adjust the session tests so they no longer depend on notes.

## Capabilities

### New Capabilities

- `template-backend`: the routes and tables that remain.

### Modified Capabilities

- `authentication`: drop the notes session rule and point the cookie tests at the account summary.
- `schema-migration`: the repeat check keeps a user, not a note.
- `notes`, `record-form`, `record-detail`, `record-sections`, `record-artifacts`, `record-table`, `collection-membership`, `saved-views`, `coverage-taxonomy`, `published-snapshots`, `observation-facts`, `analytics-charts`, `async-job`, `activity-history`, `hierarchy-navigation`, `structured-diff`, `time-windows`, `guided-wizard`, `sensitive-confirm`: remove the demo requirements listed in those deltas. Wizard progress text and the shell header rule stay.

## Impact

- Depends on `simplify-hello-shell` and `simplify-storybook` so the UI target and the story contracts exist first.
- Forward-only policy stays. Old migration files are deleted rather than altered with DROP.
- `document-existing-components` is not edited. Record permission goes away with records.

## User journey

A person can still create an account, see Hello world, and call health. Opening `/records`, `/notes`, `/collections`, or `/api/snapshots` does not show the old product. Storybook still opens the generic components.

## UI acceptance

A removed route shows an error status, not a demo screen. Loading, empty, success, validation, and permission stay on the hello and account flows. Keyboard focus and a narrow layout stay as the hello change defines them.

## Approval

`x-human-approval` is `pending`. This note is not a GitHub review.

## Breaking changes

Removing the demo routes, tables, and requirements is **BREAKING** when implemented. This spec pull request does not archive.
