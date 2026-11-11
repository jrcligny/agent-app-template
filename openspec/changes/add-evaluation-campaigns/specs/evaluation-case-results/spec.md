# Spec Delta

## Purpose

Defines the outcome of one case inside a campaign and the path used to inspect it.

## ADDED Requirements

### Requirement: RES-1 Pass and fail use the threshold
A stored score SHALL be Pass when it is greater than or equal to the case threshold, and Fail otherwise. An exact case SHALL accept only score 0 or 1. Any other score SHALL be a validation error and SHALL NOT be stored. Pass and Fail SHALL be words. Color SHALL NOT be the only signal.

#### Scenario: Threshold is inclusive
- **WHEN** the score equals the threshold
- **THEN** the outcome is Pass

#### Scenario: Exact rejects a fraction
- **WHEN** an exact case is given a score other than 0 or 1
- **THEN** the response is a validation error and no result is stored

Trace: apps/api/src/features/evaluation/results.integration.test.ts :: "RES-1 passes at the threshold and rejects a fractional exact score"

### Requirement: RES-2 Not run is not zero
A case with no result SHALL show the words Not run and SHALL NOT show a score of 0. A permission denial SHALL be a forbidden status, not an empty result list.

#### Scenario: Missing result
- **WHEN** the campaign has no result for that case
- **THEN** the detail says Not run and does not show score 0

#### Scenario: Forbidden
- **WHEN** canView is false
- **THEN** the screen shows a forbidden status and no case input

Trace: apps/api/src/features/evaluation/results.integration.test.ts :: "RES-2 does not treat a missing result as zero"

### Requirement: RES-3 The case path keeps the filter
The address SHALL keep the campaign, the case, and the outcome filter. Back SHALL return to the parent with that filter. Keyboard focus SHALL return to the case list. A narrow viewport SHALL stack the case under the list. Another account's campaign id SHALL return 404 for the whole response.

#### Scenario: Back keeps the filter
- **WHEN** the user activates Back from the keyboard
- **THEN** focus returns to the case list and the outcome filter remains in the address

#### Scenario: Another account
- **WHEN** the campaign id belongs to another account
- **THEN** the status is 404 and the body does not contain the case input

Trace: apps/web/src/features/evaluation/case-path.test.tsx :: "RES-3 returns to the filtered case list from the keyboard"

### Requirement: RES-4 The frozen case is what the result shows
The result detail SHALL show the copied input and expected outcome from the suite version. It SHALL NOT show a later draft edit. It SHALL NOT show a trace, a cost, or a latency.

#### Scenario: Draft edit is invisible
- **WHEN** the draft input changes after the campaign started
- **THEN** the result still shows the published input

Trace: apps/api/src/features/evaluation/results.integration.test.ts :: "RES-4 shows the frozen input rather than the draft"
