# Spec Delta

## Purpose

Walks a person through creating a record in steps, and stops them on the step that fails validation.

## ADDED Requirements

### Requirement: WIZ-1 Steps block on validation
The wizard SHALL show one step at a time. Next SHALL stay on the step when that step is invalid, and SHALL move focus to the invalid field.

#### Scenario: Validation error
- **WHEN** the user chooses closed status and presses Next with an empty reason
- **THEN** the wizard stays on that step and shows a validation error

#### Scenario: Success
- **WHEN** every step is valid and the user finishes from the keyboard
- **THEN** the record is created and a success status is shown

Trace: apps/web/src/features/wizard/record-wizard.test.tsx :: "WIZ-1 stays on an invalid step and focuses the field"
