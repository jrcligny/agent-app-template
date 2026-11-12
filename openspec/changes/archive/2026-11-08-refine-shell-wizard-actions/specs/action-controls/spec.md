# action-controls

## Purpose
Keeps shared buttons at the width of their label and lines action groups up on the right.

## ADDED Requirements

### Requirement: ACT-1 Buttons stay content width
A shared button SHALL default to the width of its label on a wide layout. It SHALL NOT stretch across the desktop page. Form, settings, confirmation, and table action groups SHALL use a wrapping row aligned to the end. Text inputs SHALL keep the width of their field. A narrow viewport MAY wrap the row and SHALL keep each control inside the viewport. Loading, empty, error, success, validation, permission, keyboard, and focus behavior of those screens SHALL stay as already specified.

#### Scenario: Wizard action is narrower than the row
- **WHEN** the status step is shown on a wide viewport
- **THEN** Next is narrower than the action row and its right edge sits at the end of that row

#### Scenario: Narrow wizard stays on screen
- **WHEN** the same step is shown at a 375 pixel width
- **THEN** Back and Next remain visible, at least 44 pixels tall, and inside the action row

Trace: apps/web/src/features/wizard/record-wizard.test.tsx :: "WIZ-2 shows step progress and keeps Next after Back"
Trace: e2e/tests/operations.spec.ts :: "WIZ-1 finishes the wizard and JOB-1 retries a failed export"
