# guided-wizard Specification

## Purpose
Walks a person through creating a record in steps, and stops them on the step that fails validation.

## Requirements

### Requirement: WIZ-2 Progress text
The wizard SHALL show a progress bar and the sentence `Step {current} of {total}. Current step: {title}.` The progressbar SHALL use that sentence as `aria-valuetext` and SHALL set `aria-valuenow` to the current step. Color SHALL NOT be the only indication of the step.

#### Scenario: Current step is announced
- **WHEN** the wizard is on the title step
- **THEN** the visible text and the progressbar value text are `Step 1 of 3. Current step: Record title.`

#### Scenario: Invalid step keeps progress
- **WHEN** the user chooses closed status and presses Next with an empty reason
- **THEN** focus is on the reason field and the progressbar stays on step 2

Trace: apps/web/src/features/wizard/record-wizard.test.tsx :: "WIZ-2 shows step progress and keeps Next after Back"

### Requirement: WIZ-3 Footer order
Back SHALL be the secondary action and SHALL come before Next or Finish. The action group SHALL align to the right, wrap on a narrow viewport, and keep each action at least 44 pixels tall and no wider than its label. Keyboard activation of Back SHALL return to the previous step.

#### Scenario: Footer order
- **WHEN** the wizard is on the status step
- **THEN** Back precedes Next in the right-aligned action group
- **AND** Next uses the content width of its label

Trace: apps/web/src/features/wizard/record-wizard.test.tsx :: "WIZ-2 shows step progress and keeps Next after Back"
Trace: e2e/tests/operations.spec.ts :: "WIZ-1 finishes the wizard and JOB-1 retries a failed export"
