# collection-membership Specification

## Purpose
Puts a record in more than one collection and applies bulk membership changes without silent loss.

## Requirements

### Requirement: MEM-1 Membership is many to many
A record the caller owns SHALL be allowed in more than one of their collections. Another account's record SHALL NOT appear in the caller's collections.

#### Scenario: Two collections
- **WHEN** the caller adds one owned record to two collections
- **THEN** both collections list that record

Trace: apps/api/src/features/curation/membership.integration.test.ts :: "MEM-1 lists one record in two collections"

### Requirement: MEM-2 Bulk edits are atomic and explained
Include, exclude, and annotate SHALL apply to every id in the request or to none of them. Annotate SHALL require a rationale. A mixed set SHALL NOT change any membership.

#### Scenario: Annotate
- **WHEN** the caller annotates an owned set with a rationale
- **THEN** each membership stores that rationale and a success status is shown

#### Scenario: Mixed set writes nothing
- **WHEN** the set contains an id the caller does not own
- **THEN** the response status is 404 and no membership in the set changes

#### Scenario: Missing rationale
- **WHEN** annotate is sent without a rationale
- **THEN** the response is a validation error and focus can move to the rationale field

#### Scenario: Loading and error
- **WHEN** the membership request is in flight or fails for another reason
- **THEN** a loading status or an error status is shown and the previous membership stays visible

#### Scenario: Narrow layout
- **WHEN** the viewport is narrow
- **THEN** the filter summary and the bulk action stay on screen

#### Scenario: Keyboard
- **WHEN** the user confirms the bulk action from the keyboard
- **THEN** the same atomic request is sent

Trace: apps/api/src/features/curation/membership.integration.test.ts :: "MEM-2 rolls back the batch when any id is not owned"
