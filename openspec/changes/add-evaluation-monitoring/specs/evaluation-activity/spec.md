# Spec Delta

## Purpose

Records evaluation actions in the existing activity list using campaign language.

## ADDED Requirements

### Requirement: ACT-3 Activity names the evaluation action
A suite publish, a campaign launch, and a promotion SHALL each add an activity entry that names the action and the object. The entry SHALL NOT be required to store the case score. Loading, empty, and error states of the list SHALL stay available.

#### Scenario: Launch is named
- **WHEN** a campaign is launched
- **THEN** the activity list includes an entry that says the campaign was launched

#### Scenario: Success is not a score
- **WHEN** the launch entry is shown
- **THEN** the entry does not include a case score

Trace: apps/api/src/features/evaluation/activity.integration.test.ts :: "ACT-3 records a launch without a case score"
