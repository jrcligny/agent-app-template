# Spec Delta

## Purpose

Lets a signed-in person keep a private list of notes that other accounts cannot see, with explicit loading, empty, error, and success states.

## ADDED Requirements

### Requirement: NOTES-1 Owner can create and list notes
A signed-in person SHALL create notes and see only their own notes, newest first.

#### Scenario: Create and list
- **WHEN** an account creates two notes
- **THEN** that account's list shows the newer note first
- **AND** a different account's list does not include them

Trace: apps/api/src/features/notes/notes.integration.test.ts :: "NOTES-1 creates a note and lists only that account's notes"

### Requirement: NOTES-2 Another account cannot read or change a note
A person SHALL NOT read, update, or delete another account's note. The response SHALL be the same as a missing note.

#### Scenario: Cross-account access
- **WHEN** another account requests, updates, or deletes a note id it does not own
- **THEN** each response status is 404
- **AND** the owner's note is unchanged

Trace: apps/api/src/features/notes/notes.integration.test.ts :: "NOTES-2 does not reveal another account's note"
Trace: e2e/tests/notes.spec.ts :: "NOTES-2 hides another account's note on the screen"

### Requirement: NOTES-3 Invalid note input is rejected
The API SHALL reject a note whose title is empty or only whitespace.

#### Scenario: Blank title
- **WHEN** a signed-in client submits a whitespace title
- **THEN** the response status is 400 and the error code is validation

Trace: apps/api/src/features/notes/notes.integration.test.ts :: "NOTES-3 rejects an empty title"

### Requirement: NOTES-4 The notes screen shows loading, empty, error, and success
The notes screen SHALL show loading while notes are requested, empty when the list is empty, error when loading fails, and success after a note is saved.

#### Scenario: Empty then saved
- **WHEN** a new account opens notes and saves one
- **THEN** the screen shows the empty state and then the saved note with a success state

#### Scenario: Loading and error
- **WHEN** notes are loading or the request fails
- **THEN** the screen shows a loading or error state instead of another account's notes

Trace: apps/web/src/components/feedback/status.test.tsx :: "NOTES-4 shows loading, empty, error, and success states"
Trace: e2e/tests/notes.spec.ts :: "NOTES-4 shows an empty list then the saved note"

### Requirement: NOTES-5 Validation and permission failures stay visible to keyboard users
The screen SHALL show a validation error and move focus to the title when it is empty. A missing session SHALL show the account form instead of private notes.

#### Scenario: Keyboard validation
- **WHEN** the user submits from the keyboard with an empty title
- **THEN** the validation error is visible and focus is on the title field

#### Scenario: Permission boundary
- **WHEN** no session is present
- **THEN** the account form is shown and private notes are not

Trace: e2e/tests/notes.spec.ts :: "NOTES-4 shows an empty list then the saved note"

### Requirement: NOTES-6 Narrow layout keeps the note form available
The notes screen SHALL keep the heading and title field available at a narrow viewport.

#### Scenario: Narrow width
- **WHEN** the viewport is 375 pixels wide
- **THEN** the notes heading and title field are visible

Trace: e2e/tests/notes.spec.ts :: "NOTES-4 shows an empty list then the saved note"
