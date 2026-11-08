# Proposal

## Why

The workbench MVP covers finding and editing a record. The next slice is the operations around that record: a short wizard, a cancellable job, an activity list, and settings. This change is specified now so the sequence is visible. It is not approved, and it is not part of the MVP implementation.

## What Changes

- Add a three-step wizard that blocks progress until the current step is valid.
- Add an async job with progress, cancel, failure, and retry.
- Add an activity list for the signed-in person's records.
- Add a settings form for display name and page size.
- No removals. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `guided-wizard`: multi-step create with per-step validation.
- `async-job`: progress, cancel, failure, and retry.
- `activity-history`: a paged list of the caller's record events.
- `workbench-settings`: display name and table page size.

### Modified Capabilities

- None.

## Impact

- Depends on `add-reference-workbench` records. Do not implement this change first.
- New shared wizard and progress components, reused rather than copied per screen.

## User journey

After the MVP exists, a person starts a wizard, cannot skip an invalid step, and finishes on a success state. They start an export job, watch progress, cancel it, and retry after a failure. They open activity and settings. A person without access sees a forbidden state.

## UI acceptance

Loading, empty, error, and success apply to activity, jobs, and settings. Validation blocks the wizard step. Permission failures show a forbidden state. Keyboard and focus work for next, back, cancel, and retry. A narrow viewport keeps the current step's primary action visible.

## Approval

`x-human-approval` is `pending` for this change only. Merging the pull request does not approve it. The spec check does not treat `pending` as failure and does not prove a human decision.

## Breaking changes

None.

## What changed in this revision

This increment stays the operations slice. Analytics, curation, evidence, snapshots, comparison, and hierarchy are not folded into it.
