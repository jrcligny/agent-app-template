# Proposal

## Why

Once collections and snapshots exist, people move from a collection to a snapshot, to an item, and sometimes to a child attempt. The path should keep filters and a way back. Attempts are optional. This is not a test-run product, and it is not approved by being specified.

## What Changes

- Add a generic parent path: collection, snapshot, item, and optional attempt.
- Keep the list and the detail together, with back navigation and stable URL filters.
- No removals. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `hierarchy-navigation`: master-detail movement along that path.

### Modified Capabilities

- None.

## Impact

- Depends on `add-workbench-snapshots` and record detail from `add-reference-workbench`.
- One component test for back navigation and focus. One integration test that an attempt is absent unless stored.

## User journey

A person opens a collection, chooses a snapshot, and sees its items beside the detail. They open an item. If that item has attempts, they open one. If it has none, the screen says so. Back returns to the parent with the same filters. Someone without permission sees a forbidden state.

## UI acceptance

Loading, empty, error, and success are visible. Validation is not required for navigation. Permission failure is forbidden. Keyboard and focus move from the list to the detail and back. A narrow viewport stacks the detail under the list instead of dropping the way back.

## Approval

`x-human-approval` is `pending` for this change only. Merging the pull request does not approve it. The spec check does not treat `pending` as failure and does not prove a human decision.

## Breaking changes

None.
