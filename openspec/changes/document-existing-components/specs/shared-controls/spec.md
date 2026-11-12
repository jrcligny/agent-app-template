# shared-controls

## Purpose

Names the shared controls by behavior and accessibility, not by pixel measurements.

## ADDED Requirements

### Requirement: UI-1 Buttons name their action
A button SHALL use the width of its label, SHALL be at least 44 pixels tall, and SHALL expose its action as its accessible name. Disabled buttons SHALL not be activated.

#### Scenario: Keyboard activates a named button
- **WHEN** the button has keyboard focus and the person presses Enter
- **THEN** the named action runs

Trace: apps/web/src/features/wizard/record-wizard.test.tsx :: "WIZ-1 stays on an invalid step and focuses the field"

### Requirement: UI-2 Fields expose labels and errors
A text field and a select SHALL be labeled. An error SHALL set the invalid state and SHALL be readable text. Validation SHALL keep focus on the field that failed.

#### Scenario: Empty title
- **WHEN** a required title is empty
- **THEN** the error text is shown and focus is on that field

Trace: apps/web/src/features/records/record-form.test.tsx :: "FRM-1 focuses the reason field when a closed record has no reason"

### Requirement: UI-3 Status is named in text
Loading, empty, and success SHALL be status text. Error and permission failure SHALL be alerts. Color SHALL NOT be the only signal. Success SHALL NOT use a green palette.

#### Scenario: Named states
- **WHEN** a screen is loading, empty, in error, or successful
- **THEN** each state has a visible name

Trace: apps/web/src/components/feedback/status.test.tsx :: "NOTES-4 shows loading, empty, error, and success states"

### Requirement: UI-4 Progress exposes its value
A progress indicator SHALL expose a progressbar role, a name, and the current value in text.

#### Scenario: Wizard step
- **WHEN** the wizard is on a step
- **THEN** the progressbar value text matches the visible step sentence

Trace: apps/web/src/features/wizard/record-wizard.test.tsx :: "WIZ-2 shows step progress and keeps Next after Back"

### Requirement: UI-5 A card is a surface
A card SHALL group related text. It SHALL NOT be exposed as a button unless it contains a real control.

#### Scenario: Note text
- **WHEN** a note is shown in a card
- **THEN** the title and body are text

Trace: apps/web/src/features/notes/notes-page.tsx
