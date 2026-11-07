# Proposal

## Why

The template needs one real vertical slice so agents and people can see health, sign-in, and private notes working together. A README alone cannot prove auth, data access, or the spec workflow.

## What Changes

- Add public liveness and database readiness.
- Add email and password sessions with host-only HttpOnly cookies.
- Add owner-scoped notes and a small web screen that uses shared UI.
- Add forward-only migrations that run once per release, not on each API process.
- No behavior is removed. Nothing in this change is **BREAKING**.

## Capabilities

### New Capabilities

- `health`: liveness and readiness of the API.
- `schema-migration`: forward-only database migrations.
- `authentication`: sessions, account summary, and production cookie and origin rules.
- `notes`: private notes and the screen states a person actually sees.

### Modified Capabilities

- None.

## Impact

- HTTP under `/api` on the same origin as the web app.
- PostgreSQL tables for sessions and notes.
- Web screens for account access and notes.
- Tests named by requirement id.

## User journey

A person opens the app and sees whether the API is up. They create an account, see an empty note list, and get a validation error if they submit an empty title. They add a note and see it. They sign out. A second account does not see the first account's note.

## UI acceptance

The notes screen has loading, empty, error, and success states. Empty title is a validation error and moves focus to the title field. A missing session is a permission boundary and shows the account form instead of notes. The form works from the keyboard. At a narrow width the heading and title field stay visible. Shared status, field, and button components are reused.

## Breaking changes

None. This is the initial baseline. A later removal uses `## REMOVED Requirements` with **Reason** and **Migration**. A compatibility break is marked **BREAKING** in the proposal. Do not add a DEPRECATED section; the OpenSpec parser will reject it.
