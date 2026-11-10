# hierarchy-navigation Specification

## Purpose
Moves among a collection, a snapshot, an item, and an optional attempt without dropping filters or hiding the way back.

## Requirements

### Requirement: NAV-1 The path keeps context
The screen SHALL show the current collection, snapshot, and item when those ids are in the URL. An attempt SHALL appear only when one is stored for that item. Back SHALL return to the parent with the same filters. The list and the detail SHALL stay available together.

#### Scenario: Success with no attempts
- **WHEN** the caller opens their snapshot item and that item has no attempts
- **THEN** the detail shows the item and an empty status says there are no attempts

#### Scenario: Optional attempt
- **WHEN** the item has an attempt
- **THEN** the caller can open that child and see its label

#### Scenario: Back keeps filters
- **WHEN** the user activates Back from the keyboard
- **THEN** focus returns to the parent list and the previous status filter is still in the URL

#### Scenario: Permission
- **WHEN** the session is not allowed to use this path
- **THEN** the screen shows a forbidden status

#### Scenario: Another account
- **WHEN** another account's snapshot id is in the URL
- **THEN** the response status is 404

#### Scenario: Loading and error
- **WHEN** the path request is in flight or fails
- **THEN** a loading status or an error status is shown

#### Scenario: Narrow layout
- **WHEN** the viewport is narrow
- **THEN** the detail stacks under the list and the back control remains visible

Trace: apps/web/src/features/hierarchy/hierarchy.test.tsx :: "NAV-1 returns to the filtered parent from the keyboard"
Trace: apps/api/src/features/hierarchy/hierarchy.integration.test.ts :: "NAV-1 omits attempts that were not stored and hides another account"

### Requirement: NAV-2 Navigation does not invent a score
Opening the path SHALL NOT compute a quality score from how many items or attempts exist.

#### Scenario: Count is not quality
- **WHEN** the snapshot has items
- **THEN** the screen does not label that count as quality or coverage

Trace: apps/web/src/features/hierarchy/hierarchy.test.tsx :: "NAV-2 does not present an item count as quality"

### Requirement: NAV-3 An attempt label is required when an attempt is stored
The API SHALL reject an attempt whose label is empty.

#### Scenario: Validation
- **WHEN** a client stores an attempt with an empty label
- **THEN** the response is a validation error and no attempt is added

Trace: apps/api/src/features/hierarchy/hierarchy.integration.test.ts :: "NAV-3 rejects an attempt with an empty label"
