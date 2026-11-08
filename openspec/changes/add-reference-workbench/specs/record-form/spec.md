# Spec Delta

## Purpose

Creates and edits a record with conditional validation and a warning when the person leaves unsaved changes.

## ADDED Requirements

### Requirement: FRM-1 Conditional validation
The form SHALL require a title. When status is closed, it SHALL also require a reason. The API SHALL reject the same invalid body.

#### Scenario: Validation error
- **WHEN** the user submits a closed record with an empty reason
- **THEN** the reason field shows a validation error and focus moves to that field
- **AND** the API responds 400 for the same body

#### Scenario: Success
- **WHEN** the user submits a valid open record
- **THEN** the record is saved and a success status is shown

Trace: apps/api/src/features/records/records.integration.test.ts :: "FRM-1 rejects a closed record without a reason"
Trace: apps/web/src/features/records/record-form.test.tsx :: "FRM-1 focuses the reason field when a closed record has no reason"

### Requirement: FRM-2 Unsaved changes
The edit form SHALL ask before navigation when the fields differ from the last successful save.

#### Scenario: Leave without saving
- **WHEN** the user edits the title and moves to another route
- **THEN** a confirmation is shown and the route does not change until they confirm

Trace: apps/web/src/features/records/record-form.test.tsx :: "FRM-2 asks before leaving unsaved edits"
