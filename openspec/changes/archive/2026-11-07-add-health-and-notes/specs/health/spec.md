# Spec Delta

## Purpose

Reports whether the API process is up and whether its database schema is ready, without granting access to private data.

## ADDED Requirements

### Requirement: HEALTH-1 Public liveness
The API SHALL report liveness without a session and without reading private data.

#### Scenario: Anonymous liveness
- **WHEN** a client requests GET /api/health with no session
- **THEN** the response status is 200
- **AND** the body status is ok and the service is api

Trace: apps/api/src/features/health/health.integration.test.ts :: "HEALTH-1 reports liveness without a session"

### Requirement: HEALTH-2 Readiness follows the schema
The API SHALL report readiness only when the database answers and the note table exists.

#### Scenario: Schema present
- **WHEN** the note table exists and a client requests GET /api/health/ready
- **THEN** the response status is 200 and the database field is ok

#### Scenario: Schema absent
- **WHEN** the note table is absent and a client requests GET /api/health/ready
- **THEN** the response status is 503 and the database field is unavailable

Trace: apps/api/src/features/health/health.integration.test.ts :: "HEALTH-2 reports readiness when the schema is present"
Trace: apps/api/src/features/health/health.integration.test.ts :: "HEALTH-2 reports unavailable readiness before migration"
