# Spec Delta

## Purpose

Stops a destructive record action until the person confirms it, including from the keyboard.

## ADDED Requirements

### Requirement: CFM-1 Delete is confirmed and atomic
Single delete and bulk delete SHALL open a confirmation dialog that names the count, and SHALL NOT call the API until the person confirms. A confirmed bulk delete SHALL delete every owned id in the set or delete none of them.

#### Scenario: Dismiss
- **WHEN** the dialog is open and the user presses Escape
- **THEN** no record is deleted and focus returns to the control that opened the dialog

#### Scenario: Confirm owned set
- **WHEN** the user confirms from the keyboard a set of ids they own
- **THEN** every id in that set is deleted and a success status is shown

#### Scenario: Mixed set deletes nothing
- **WHEN** the confirmed set contains an id the caller does not own or that does not exist
- **THEN** the response status is 404, no id from the set is deleted, and an error states that the batch was not applied

#### Scenario: Forbidden
- **WHEN** the session is not allowed to delete records
- **THEN** the dialog is not offered and the API responds with a permission error

Trace: apps/web/src/features/records/confirm-delete.test.tsx :: "CFM-1 does not delete when the dialog is dismissed"
Trace: apps/api/src/features/records/records.integration.test.ts :: "CFM-1 deletes only the caller's confirmed records"
