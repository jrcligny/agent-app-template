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

A signed-in person opens the dashboard, sees how many records are open, and goes to the table. They search, filter, sort, and page. They select rows and must confirm before bulk delete. They open a drawer for a short summary and a full page for the long body. They create a record, edit it, and get stopped if they leave with unsaved changes. A person without access sees a forbidden state and no rows.

## UI acceptance

Every screen in this change has loading, empty, error, and success. Validation errors stay on the field. Permission failures show a forbidden state. Keyboard users can reach search, rows, dialogs, and the form. Focus moves into a dialog and returns when it closes. A narrow viewport keeps search and the primary action visible.

## Breaking changes

None.

## Later increments

Wizard, async progress, activity history, and settings are specified separately in `add-workbench-operations`. They are not part of this change and are not a reason to implement them now.
