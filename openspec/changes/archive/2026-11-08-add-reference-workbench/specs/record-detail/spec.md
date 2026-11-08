# Spec Delta

## Purpose

Shows a short record summary in a drawer and the long body on its own route, without leaking another account's record.

## ADDED Requirements

### Requirement: DET-1 Drawer and full page
Opening a row SHALL show a drawer with the title and summary. A control in the drawer SHALL open `/records/:id` for the body.

#### Scenario: Success
- **WHEN** the caller opens their record
- **THEN** the drawer shows the summary and the full route shows the body

#### Scenario: Loading and error
- **WHEN** the detail request is in flight or fails
- **THEN** the drawer shows a loading status or an error status

#### Scenario: Focus
- **WHEN** the drawer opens
- **THEN** focus moves inside it, and Escape closes it and restores focus

Trace: apps/web/src/features/records/record-detail.test.tsx :: "DET-1 moves focus into the drawer and opens the full route"

### Requirement: DET-2 Another account's record stays hidden
The detail endpoint SHALL respond as if a record does not exist when the caller does not own it.

#### Scenario: Cross-account read
- **WHEN** another account requests the record id
- **THEN** the response status is 404

Trace: apps/api/src/features/records/records.integration.test.ts :: "DET-2 does not reveal another account's record"
