# Proposal

## Why

People need to compare two frozen sets, or two time windows, without pretending every provenance field exists. Time must have an explicit zone. This increment is not approved by being specified.

## What Changes

- Define period bounds, hour or day granularity, UTC storage, and Europe/Paris display.
- Compare two snapshots or two observation windows as added, removed, and changed.
- Show optional provenance side by side. Missing fields stay missing.
- No removals. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `time-windows`: inclusive start, exclusive end, and timezone buckets.
- `structured-diff`: added, removed, and changed between two baselines.

### Modified Capabilities

- None.

## Impact

- Depends on `add-workbench-snapshots` and `add-workbench-analytics`.
- One integration test for the membership diff and the Paris bucket. One component test for the side-by-side rows.

## User journey

A person picks two published snapshots. The screen lists records only in the first, only in the second, and present in both with a changed field. They can also compare two observation windows. Provenance such as environment, config digest, or code version appears only when at least one side has it. A narrow viewport keeps the diff table available.

## UI acceptance

Loading, empty, error, and success are visible. Validation rejects an unordered window. Permission failure is forbidden. Keyboard and focus can move between the two sides. A narrow viewport keeps the diff table.

## Approval

`x-human-approval` is `pending` for this change only. Merging the pull request does not approve it. The spec check does not treat `pending` as failure and does not prove a human decision.

## Breaking changes

None.
