# Spec Delta

## Purpose

Names the backend that remains after every demo feature is removed.

## ADDED Requirements

### Requirement: BACK-1 Only auth and health remain
The API SHALL serve better-auth, `GET /api/me`, `GET /api/health`, and `GET /api/health/ready`. It SHALL NOT serve notes, records, collections, tags, saved views, jobs, activity, analytics, evidence, snapshots, comparisons, or hierarchy.

#### Scenario: Health stays public
- **WHEN** a client calls `GET /api/health` without a session
- **THEN** the response reports the API is up

#### Scenario: Demo route is gone
- **WHEN** a client calls `GET /api/records`
- **THEN** the response is not found

Trace: apps/api/src/features/health/health.integration.test.ts :: "BACK-1 serves health and does not serve records"

### Requirement: BACK-2 The schema is the auth tables
The shipped migration SHALL create only user, session, account, and verification. It SHALL NOT contain DROP or TRUNCATE. Running it twice SHALL keep a user that was inserted after the first run. A database that already applied the demo migrations is not upgraded in place.

#### Scenario: Second run
- **WHEN** a user exists and the migration command runs again
- **THEN** that user is still stored

Trace: apps/api/src/features/health/health.integration.test.ts :: "BACK-2 keeps a user when migration runs twice"

### Requirement: SURF-1 Removed pages are not served
A removed page SHALL show an error status, not the old screen. The hello page SHALL keep its loading, empty, success, validation, and permission behavior. Keyboard focus and a narrow layout SHALL follow the hello requirements.

#### Scenario: Old path
- **WHEN** a person opens `/records`
- **THEN** the app does not show the record table

Trace: e2e/tests/hello-theme.spec.ts :: "SURF-1 does not open the record screen"
