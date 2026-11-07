# Spec Delta

## Purpose

Gives a signed-in person a dashboard and a clear forbidden state, using the same tokens and status component as the rest of the app.

## ADDED Requirements

### Requirement: WB-1 Dashboard shows open records
The dashboard SHALL show the count of records the signed-in person can see and a link to the record table.

#### Scenario: Success
- **WHEN** the person has at least one open record and the dashboard request succeeds
- **THEN** the count is visible and the table link can be used from the keyboard

#### Scenario: Loading and empty
- **WHEN** the dashboard is loading, or the person has no records
- **THEN** a loading status or an empty status is shown, not a zero that pretends the request failed

#### Scenario: Error
- **WHEN** the dashboard request fails
- **THEN** an error status is shown with a retry action

Trace: apps/web/src/features/workbench/dashboard.integration.test.tsx :: "WB-1 shows loading, empty, error, and success on the dashboard"

### Requirement: WB-2 Forbidden state hides records
A person without access SHALL see a permission error and SHALL NOT see record rows.

#### Scenario: Permission denied
- **WHEN** the session is signed in but is not allowed to view records
- **THEN** the screen shows a forbidden status and no record title

Trace: apps/api/src/features/records/records.integration.test.ts :: "WB-2 rejects a session that is not allowed to list records"
