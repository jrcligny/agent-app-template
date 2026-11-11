# Spec Delta

## Purpose

Defines how a campaign is compared with the agent's baseline and when a person may promote that version.

## ADDED Requirements

### Requirement: BASE-1 An agent has at most one baseline
The baseline SHALL be one promoted campaign id for that agent, or none. A second pin SHALL NOT be stored. Another account's campaign id SHALL return 404 and SHALL NOT change the pin.

#### Scenario: One pin
- **WHEN** a second campaign is promoted for the same agent
- **THEN** the agent baseline points at the newer campaign only

Trace: apps/api/src/features/evaluation/baseline.integration.test.ts :: "BASE-1 keeps a single baseline pin"

### Requirement: BASE-2 Comparison names the change
Each shared case SHALL be improved, regressed, or unchanged. A lower score, or a Pass that became Fail, SHALL be regressed. The same score and the same outcome SHALL be unchanged. A case only on one side SHALL be added or removed. A missing result SHALL stay Not run and SHALL NOT count as zero or as regressed. The label SHALL be a word. Color SHALL NOT be the only signal.

#### Scenario: Refund regresses
- **WHEN** Harbor 1.3.0 is compared with the Harbor 1.2.0 baseline
- **THEN** Refund over the limit is regressed and Delayed package is unchanged

#### Scenario: Not run is not a regression
- **WHEN** a case has no result on the candidate
- **THEN** that case is Not run and is not labeled regressed

Trace: apps/api/src/features/evaluation/baseline.integration.test.ts :: "BASE-2 labels the Harbor refund as regressed"

### Requirement: BASE-3 Promotion is confirmed and does not deploy
A campaign SHALL be promotable only when it is complete, every case is Pass, and no case is regressed. With no baseline, every case passing SHALL be enough. The person SHALL confirm. A false canCurate permission SHALL return 403 and SHALL NOT change the baseline. Promotion SHALL NOT start a pipeline or a deploy.

#### Scenario: A failure blocks promotion
- **WHEN** Harbor 1.3.0 is complete and Refund over the limit is Fail
- **THEN** Promote is not available

#### Scenario: First promotion
- **WHEN** Field notes 0.9.0 has no baseline and every case is Pass and the person confirms
- **THEN** that campaign becomes the baseline and no pipeline starts

Trace: apps/api/src/features/evaluation/baseline.integration.test.ts :: "BASE-3 promotes Field notes and refuses Harbor 1.3.0"

### Requirement: BASE-4 The comparison screen shows its state
The screen SHALL show loading, empty, error, and success. A validation error SHALL say when the campaign is not complete. Keyboard focus SHALL return to the invoker when the confirm dialog closes. A narrow viewport SHALL keep the comparison table on screen.

#### Scenario: Dialog returns focus
- **WHEN** the user closes the confirm dialog from the keyboard
- **THEN** focus returns to the Promote button

#### Scenario: Empty baseline
- **WHEN** the agent has no baseline
- **THEN** an empty status says there is no baseline yet

Trace: apps/web/src/features/evaluation/promote.test.tsx :: "BASE-4 returns focus from the confirm dialog"
