# coverage-taxonomy Specification

## Purpose
Shows how published members spread across categories only when a coverage target lists those categories.

## Requirements

### Requirement: COV-1 Missing categories require a target
If a snapshot has a coverage target, the screen SHALL show the count of members in each target category and SHALL list target categories with a count of zero as missing. If it has no target, the screen SHALL NOT list missing categories and SHALL NOT present the member count as a quality score.

#### Scenario: Target lists a gap
- **WHEN** the target categories are alpha, beta, and gamma, and the snapshot has no beta member
- **THEN** beta is listed as missing and the other counts match the members

#### Scenario: No target
- **WHEN** the snapshot has members and no coverage target
- **THEN** the screen shows the counts it can compute and does not say any category is missing

#### Scenario: Loading and error
- **WHEN** the coverage request is in flight or fails
- **THEN** a loading status or an error status is shown instead of a zero quality score

#### Scenario: Narrow layout
- **WHEN** the viewport is narrow
- **THEN** the category table remains available

Trace: apps/api/src/features/snapshots/coverage.integration.test.ts :: "COV-1 lists a missing category only when a target includes it"
