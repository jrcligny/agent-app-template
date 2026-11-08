# Proposal

## Why

The bootstrap notes slice proves auth and one resource. A reference workbench should show the shared UI patterns an internal app repeats, using synthetic records only. This change is the first implementation slice. It is not approved by being written here.

## What Changes

- Add a dashboard and app shell for signed-in people.
- Add a record table with search, status filter, sort, pagination, selection, and one bulk delete.
- Add a quick drawer and a routable detail page.
- Add create and edit forms with conditional validation and an unsaved-changes confirmation.
- Add a confirmation dialog before delete.
- No behavior is removed. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `workbench-shell`: dashboard, navigation, and permission states.
- `record-table`: search, filter, sort, pagination, selection, and bulk delete.
- `record-detail`: drawer summary and routable full record.
- `record-form`: create and edit with conditional validation and unsaved changes.
- `sensitive-confirm`: confirmation before a destructive record action.

### Modified Capabilities

- None. `openspec/specs/` is not updated by this proposal.

## Impact

- New web routes and shared table, drawer, and dialog components.
- API list and mutation endpoints for synthetic records, with the same session and owner rules as notes.
- Integration tests named by requirement id. Those tests do not exist until an implementation pull request.

## User journey

A signed-in person opens the dashboard and sees two labeled counts: every record they can read, and how many of those are open. Zero means that defined set is empty. A failed request does not show zero. They open the matching table, search, filter, sort, and page. They select rows and must confirm before bulk delete. If the set mixes in a record they do not own, nothing in the set is deleted. They open a drawer for a short summary and a full page for the long body. They create a record, edit it, and get stopped if they leave with unsaved changes. A person without permission sees a forbidden state, not an empty list.

## UI acceptance

Every screen in this change has loading, empty, error, and success. Validation errors stay on the field. Permission failures show a forbidden state. Keyboard users can reach search, rows, dialogs, and the form. Focus moves into a dialog and returns when it closes. A narrow viewport keeps search and the primary action visible.

## Breaking changes

None.

## Approval

`x-human-approval` is `pending` for this change only. Merging the pull request does not change that field and does not approve the other changes in the same pull request. A human records acceptance on this change after review. The spec check rejects a self-approval value. It does not prove a human approved, and a `pending` value does not fail that check.

## Later increments

These are separate changes in the same pull request. None of them is part of this MVP:

- `add-workbench-operations`: wizard, job, activity, settings.
- `add-workbench-analytics`: defined counters, charts, and drill-through.
- `add-workbench-curation`: tags, saved views, collections, bulk membership.
- `add-workbench-evidence`: structured sections and artifacts.
- `add-workbench-snapshots`: immutable published membership.
- `add-workbench-comparison`: time windows and side-by-side diff.
- `add-workbench-hierarchy`: parent and child navigation.

## What changed in this revision

The dashboard no longer uses one unlabeled count. Bulk delete is all or nothing. Forbidden is distinct from zero records.
