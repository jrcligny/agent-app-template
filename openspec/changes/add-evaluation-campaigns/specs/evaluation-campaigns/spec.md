# Spec Delta

## Purpose

Defines a campaign as one agent version scored against one published suite version by a deterministic demo job.

## ADDED Requirements

### Requirement: CAMP-1 Launch binds one version and one suite
The wizard SHALL require an agent version, a published suite version, and a non-empty name. A draft suite SHALL be a validation error and SHALL NOT start a campaign.

#### Scenario: Draft suite
- **WHEN** the chosen suite version is not published
- **THEN** the response is a validation error and no campaign is stored

#### Scenario: Wizard focus
- **WHEN** the name is empty and the user chooses Next from the keyboard
- **THEN** focus stays on the name field and the campaign is not created

Trace: apps/web/src/features/evaluation/launch.test.tsx :: "CAMP-1 keeps focus on an empty campaign name"

### Requirement: CAMP-2 The demo job replays seeded scores
Starting a campaign SHALL set status running and SHALL write the seeded score for each case of that agent version. The job SHALL NOT call an external model. The same version and suite SHALL write the same scores on every run.

#### Scenario: Repeat is stable
- **WHEN** the same agent version and suite version run twice
- **THEN** the stored scores match

Trace: apps/api/src/features/evaluation/campaigns.integration.test.ts :: "CAMP-2 replays the seeded scores"

### Requirement: CAMP-3 Progress is a count, not an unknown
The screen SHALL show the completed count and the total count with a loading, error, success, or empty status. Zero completed while running SHALL be a measured zero. A suite version with no cases SHALL be a validation error and SHALL NOT start.

#### Scenario: Running from zero
- **WHEN** a campaign has started and no score is stored yet
- **THEN** the progress shows 0 completed and the suite size as the total

Trace: apps/api/src/features/evaluation/campaigns.integration.test.ts :: "CAMP-3 treats zero completed as a measured zero"

### Requirement: CAMP-4 Seeded scores for the demo versions
Harbor support 1.2.0 SHALL score Delayed package 1, Refund over the limit 1, Address change 0.9, and Missing order id 0.5. Harbor support 1.3.0 SHALL use the same scores except Refund over the limit at 0. Harbor support 1.3.1 SHALL score only Delayed package at 1 and leave the other cases without a result. Field notes 0.9.0 SHALL score Short visit 1 and Missing reading 0.8.

#### Scenario: Harbor 1.3.0 refund
- **WHEN** Harbor support 1.3.0 finishes Support regression 3
- **THEN** Refund over the limit has score 0 and the other three cases have the 1.2.0 scores

Trace: apps/api/src/features/evaluation/campaigns.integration.test.ts :: "CAMP-4 writes the Harbor and Field notes demo scores"
