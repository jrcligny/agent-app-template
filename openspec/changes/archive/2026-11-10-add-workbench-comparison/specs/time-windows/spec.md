# Spec Delta

## Purpose

States how a period is bounded, bucketed, and labeled without moving the stored instant.

## ADDED Requirements

### Requirement: TIME-1 Bounds and zones are explicit
A window SHALL be inclusive at `from` and exclusive at `to`, stored and compared in UTC. Buckets SHALL use the requested granularity of hour or day and the requested timezone. Display labels SHALL default to Europe/Paris. The instant `2026-01-15T23:30:00Z` SHALL fall on 16 January in a Europe/Paris day bucket and on 15 January in a UTC day bucket.

#### Scenario: Paris versus UTC
- **WHEN** the caller buckets that instant by day in Europe/Paris and again in UTC
- **THEN** the Paris bucket is 16 January and the UTC bucket is 15 January

#### Scenario: Validation
- **WHEN** `from` is not before `to`
- **THEN** the response is a validation error

Trace: apps/api/src/features/comparison/windows.integration.test.ts :: "TIME-1 places 23:30Z on 16 January in Paris and 15 January in UTC"
