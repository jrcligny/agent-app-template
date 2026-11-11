# Spec Delta

## Purpose

Defines a test suite version as a frozen set of cases, each with an input, an expected outcome, and a scoring rule.

## ADDED Requirements

### Requirement: SUI-1 A suite version freezes its cases
Publishing SHALL copy each case input, expected outcome, scoring rule, and threshold. Later draft edits SHALL NOT change that copy. A published version SHALL reject case edits.

#### Scenario: Draft edits stay out
- **WHEN** a case input changes after publish
- **THEN** the published copy still has the previous input

Trace: apps/api/src/features/evaluation/suites.integration.test.ts :: "SUI-1 keeps the published case after the draft changes"

### Requirement: SUI-2 A case states how it scores
A case SHALL have non-empty input, non-empty expected outcome, scoring rule exact or numeric, and a threshold from 0 to 1 inclusive. Exact is reserved for scores of 0 or 1. Numeric compares a score with the threshold.

#### Scenario: Threshold out of range
- **WHEN** the threshold is below 0 or above 1
- **THEN** the response is a validation error and no case is stored

Trace: apps/api/src/features/evaluation/suites.integration.test.ts :: "SUI-2 rejects a threshold outside 0 to 1"

### Requirement: SUI-3 A case has no trace or review
A case SHALL NOT store a trace, a cost, a latency, or a human review.

#### Scenario: Extra fields are refused
- **WHEN** the payload includes a trace or a review comment
- **THEN** the response is a validation error and no case is stored

Trace: apps/api/src/features/evaluation/suites.integration.test.ts :: "SUI-3 rejects a trace or a review"

### Requirement: SUI-4 Publish requires a name and a case
A suite version SHALL have a non-empty name. Publishing a suite with no cases SHALL be a validation error and SHALL NOT create a version.

#### Scenario: Empty publish
- **WHEN** the suite has no cases
- **THEN** the response is a validation error and no version is stored

Trace: apps/api/src/features/evaluation/suites.integration.test.ts :: "SUI-4 rejects a suite version with no cases"
