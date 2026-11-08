# Proposal

## Why

A collection changes while people still need a fixed list they can repeat. A published snapshot must not move when the source record is edited or deleted. A count of records is not a quality score. This increment is not approved by being specified.

## What Changes

- Separate an editable draft membership from an immutable published snapshot.
- Compare is specified in `add-workbench-comparison`. This change only freezes membership and optional coverage.
- Show category counts only against an explicit taxonomy target. Missing categories appear only then.
- No removals. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `published-snapshots`: immutable membership and revision.
- `coverage-taxonomy`: distribution against a declared target.

### Modified Capabilities

- None.

## Impact

- Depends on collections from `add-workbench-curation`.
- One integration test proves a later source edit does not change the snapshot.

## User journey

A person edits a draft collection, then publishes it. They later rename a source record. The published snapshot still shows the old title and the same members. If they set a coverage target of three categories and one is absent, the screen lists that missing category. Without a target, it does not invent missing categories or a quality score.

## UI acceptance

Loading, empty, error, and success are visible. Validation applies to an empty publish name. Permission failure is forbidden. Keyboard and focus can publish and move through the category table. A narrow viewport keeps that table available.

## Approval

`x-human-approval` is `pending` for this change only. Merging the pull request does not approve it. The spec check does not treat `pending` as failure and does not prove a human decision.

## Breaking changes

None.
