# Spec Delta

## Purpose

Defines the only rows analytics may aggregate, so a chart cannot show a number the stored observations do not support.

## ADDED Requirements

### Requirement: OBS-1 Fixture totals are deterministic
The API SHALL store observation time in UTC and SHALL aggregate only stored rows. For fixture `alpha` and the UTC window from `2026-01-15T00:00:00Z` inclusive to `2026-01-16T00:00:00Z` exclusive, the count SHALL be 3, the sum of value SHALL be 10, the open count SHALL be 2, and the closed count SHALL be 1.

#### Scenario: Normative window
- **WHEN** the caller requests that UTC window for fixture `alpha`
- **THEN** the totals are 3, 10, 2, and 1 as defined above

#### Scenario: Paris day bucket
- **WHEN** the same rows are bucketed by day in Europe/Paris
- **THEN** the observation at `2026-01-15T23:30:00Z` is in the 16 January bucket
- **AND** a UTC day bucket keeps that observation on 15 January

Trace: apps/api/src/features/analytics/analytics.integration.test.ts :: "OBS-1 matches the fixture totals and the Paris day bucket"
