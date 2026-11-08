# Spec Delta

## Purpose

Freezes who was in a collection, and what they looked like, at the moment of publish.

## ADDED Requirements

### Requirement: SNP-1 Published membership does not follow later edits
A draft collection SHALL remain editable. Publishing SHALL create an immutable snapshot of member ids and their title, status, and category. A later edit or delete of a source record SHALL NOT change that snapshot.

#### Scenario: Success
- **WHEN** the owner publishes a draft that contains two records
- **THEN** the snapshot lists those two ids and a success status is shown

#### Scenario: Source edit
- **WHEN** the owner then renames one source record and deletes the other
- **THEN** the snapshot still shows the original titles and both member ids

#### Scenario: Empty draft
- **WHEN** the owner publishes a draft with no members
- **THEN** the snapshot is empty and an empty status says there are no members

#### Scenario: Permission
- **WHEN** the session is not allowed to publish
- **THEN** the screen shows a forbidden status and no snapshot is created

#### Scenario: Another account
- **WHEN** another account requests the snapshot id
- **THEN** the response status is 404

Trace: apps/api/src/features/snapshots/snapshots.integration.test.ts :: "SNP-1 keeps published titles after the source records change"

### Requirement: SNP-2 Publish name is required
Publishing SHALL require a non-empty name.

#### Scenario: Validation
- **WHEN** the user publishes with an empty name
- **THEN** a validation error is shown and focus is on the name field

#### Scenario: Keyboard
- **WHEN** the user publishes from the keyboard with a name
- **THEN** the same snapshot is created

Trace: apps/web/src/features/snapshots/publish.test.tsx :: "SNP-2 focuses the name field when publish name is empty"
