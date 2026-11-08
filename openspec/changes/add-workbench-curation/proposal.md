# Proposal

## Why

People group the same records in more than one place, save a filter, and apply a bulk membership change without losing rows. This increment specifies that curation. It is not approved by being written here.

## What Changes

- Add tags and multi-criteria filters stored in the URL.
- Add a named view that reopens those filters.
- Let a record belong to more than one collection.
- Bulk include, exclude, or annotate only as an atomic change with a rationale.
- No removals. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `saved-views`: tags, URL filters, and named views.
- `collection-membership`: many collections per record, with atomic bulk edits.

### Modified Capabilities

- None.

## Impact

- Depends on records from `add-reference-workbench`.
- One integration test for membership atomicity. One component test for restoring a view from the URL.

## User journey

A person filters the table, copies the URL, and later opens the same rows. They save that filter as a view. They add selected records to a collection. If one selected record is not theirs, none of the batch changes. They can attach a short rationale. Someone without permission sees a forbidden state.

## UI acceptance

Loading, empty, error, and success are visible. Validation requires a rationale on annotate. Permission failures do not change membership. Keyboard and focus reach filters and the bulk action. A narrow viewport keeps the filter summary visible.

## Approval

`x-human-approval` is `pending` for this change only. Merging the pull request does not approve it. The spec check does not treat `pending` as failure and does not prove a human decision.

## Breaking changes

None.
