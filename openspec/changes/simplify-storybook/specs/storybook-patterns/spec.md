# Spec Delta

## Purpose

States the generic behavior the remaining composite stories must show, without a record API.

## ADDED Requirements

### Requirement: PAT-1 The table story filters sample rows
The data table story SHALL show search, a status filter, sort, and pagination on sample rows. An empty filter SHALL show an empty status and keep the search field. It SHALL NOT call a record API.

#### Scenario: Empty filter
- **WHEN** the sample filter matches nothing
- **THEN** the story shows an empty status

Trace: apps/web/src/components/data/data-table.stories.tsx :: "PAT-1 shows an empty sample filter"

### Requirement: PAT-2 The wizard frame story shows progress
The wizard frame story SHALL show step text, a progress value, and Back before Next. A validation error on Next SHALL keep focus on the sample field. It SHALL NOT create a record. Color SHALL NOT be the only step signal.

#### Scenario: Invalid step
- **WHEN** the sample field is empty and Next is chosen from the keyboard
- **THEN** focus stays on that field

Trace: apps/web/src/components/wizard/wizard-frame.stories.tsx :: "PAT-2 keeps focus on an invalid sample step"

### Requirement: PAT-3 Drawer and confirm stories are keyboard safe
The drawer story SHALL show loading, error, and success states and SHALL return focus when closed. The confirm story SHALL name the action, SHALL NOT proceed on Escape, and SHALL return focus to the opener. A narrow viewport SHALL keep both controls usable. A permission error is not part of these stories.

#### Scenario: Escape
- **WHEN** the confirm story is open and the user presses Escape
- **THEN** the dialog closes and focus returns to the opener

Trace: apps/web/src/components/overlay/confirm-dialog.stories.tsx :: "PAT-3 returns focus when the confirm story is dismissed"
