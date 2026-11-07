# Spec Delta

## Purpose

Stops a destructive record action until the person confirms it, including from the keyboard.

## ADDED Requirements

### Requirement: CFM-1 Delete requires confirmation
Single delete and bulk delete SHALL open a confirmation dialog that names the count, and SHALL NOT call the API until the person confirms.

#### Scenario: Dismiss
- **WHEN** the dialog is open and the user presses Escape
- **THEN** no record is deleted and focus returns to the control that opened the dialog

#### Scenario: Confirm
- **WHEN** the user confirms from the keyboard
- **THEN** the selected records they own are deleted and a success status is shown

#### Scenario: Forbidden
- **WHEN** the user is not allowed to delete
- **THEN** the dialog is not offered and the API responds with a permission error

Trace: apps/web/src/features/records/confirm-delete.test.tsx :: "CFM-1 does not delete when the dialog is dismissed"
Trace: apps/api/src/features/records/records.integration.test.ts :: "CFM-1 deletes only the caller's confirmed records"
