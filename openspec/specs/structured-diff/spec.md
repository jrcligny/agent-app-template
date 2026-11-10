# structured-diff Specification

## Purpose
Compares two snapshots, or two observation windows, as added, removed, and changed, without requiring optional provenance.

## Requirements

### Requirement: DIFF-1 Membership and field changes
Comparing two snapshots the caller can read SHALL list ids only in the first as removed, ids only in the second as added, and ids in both with a different copied field as changed. The same words SHALL apply to observation ids across two windows.

#### Scenario: Success
- **WHEN** the first snapshot has records A and B, the second has B and C, and B's title differs
- **THEN** A is removed, C is added, and B is changed
- **AND** a success status is shown

#### Scenario: Empty
- **WHEN** both sides have the same ids and copied fields
- **THEN** an empty status says there are no differences

#### Scenario: Permission
- **WHEN** the session is not allowed to compare
- **THEN** the screen shows a forbidden status

#### Scenario: Another account
- **WHEN** another account's snapshot id is requested
- **THEN** the response status is 404

Trace: apps/api/src/features/comparison/diff.integration.test.ts :: "DIFF-1 classifies added, removed, and changed"

### Requirement: DIFF-2 Provenance is optional
Environment name, config digest, and code version SHALL appear on a side-by-side row only when at least one side has that value. A missing value SHALL NOT be shown as a default.

#### Scenario: One side has a code version
- **WHEN** only the second snapshot has a code version
- **THEN** the row shows that value on the second side and a blank on the first
- **AND** environment and config digest are omitted if neither side has them

#### Scenario: Loading and error
- **WHEN** the diff request is in flight or fails
- **THEN** a loading status or an error status is shown

#### Scenario: Keyboard and narrow layout
- **WHEN** the user moves through the diff from the keyboard on a narrow viewport
- **THEN** focus can reach each row and the diff table stays available

Trace: apps/web/src/features/comparison/diff-table.test.tsx :: "DIFF-2 omits provenance that neither side has and keeps focus on a narrow table"
