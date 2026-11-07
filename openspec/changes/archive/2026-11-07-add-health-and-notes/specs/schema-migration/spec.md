# Spec Delta

## Purpose

Applies database changes once, in order, and refuses SQL that would destroy existing data.

## ADDED Requirements

### Requirement: MIG-1 Repeating migration keeps stored notes
The migration command SHALL be safe to run again without deleting notes already stored.

#### Scenario: Second run
- **WHEN** a note exists and the migration command runs again
- **THEN** that note is still stored

Trace: apps/api/src/features/health/health.integration.test.ts :: "MIG-1 keeps stored notes when migration runs twice"

### Requirement: MIG-2 Destructive SQL is refused
The migration command SHALL refuse SQL that drops tables, drops columns, or truncates data.

#### Scenario: Drop statement
- **WHEN** a migration file contains DROP TABLE, DROP COLUMN, or TRUNCATE
- **THEN** the migration check fails before that SQL is applied

Trace: apps/api/src/migration-policy.test.ts :: "MIG-2 rejects destructive SQL"
