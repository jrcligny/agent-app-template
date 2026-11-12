# schema-migration Specification

## Purpose
Applies database changes once, in order, and refuses SQL that would destroy existing data.

## Requirements

### Requirement: MIG-2 Destructive SQL is refused
The migration command SHALL refuse SQL that drops tables, drops columns, or truncates data.

#### Scenario: Drop statement
- **WHEN** a migration file contains DROP TABLE, DROP COLUMN, or TRUNCATE
- **THEN** the migration check fails before that SQL is applied

Trace: apps/api/src/migration-policy.test.ts :: "MIG-2 rejects destructive SQL"
