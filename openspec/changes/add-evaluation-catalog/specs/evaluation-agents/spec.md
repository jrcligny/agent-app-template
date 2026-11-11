# Spec Delta

## Purpose

Defines an agent as the system under evaluation and an agent version as the immutable label a campaign can bind.

## ADDED Requirements

### Requirement: AGT-1 An agent is the evaluated system
An agent SHALL have a non-empty name that is unique for the signed-in account. A version SHALL NOT exist without an agent.

#### Scenario: Empty name
- **WHEN** the name is blank
- **THEN** the response is a validation error and no agent is stored

#### Scenario: Duplicate name
- **WHEN** the account already has that name
- **THEN** the response is a validation error and no second agent is stored

Trace: apps/api/src/features/evaluation/agents.integration.test.ts :: "AGT-1 rejects a blank or duplicate agent name"

### Requirement: AGT-2 A version label is immutable
An agent version SHALL have a label unique for that agent. After creation, that label SHALL NOT change. Later campaigns SHALL reference the version id.

#### Scenario: Rename leaves the version
- **WHEN** the agent name changes after a version exists
- **THEN** the version label is unchanged

Trace: apps/api/src/features/evaluation/agents.integration.test.ts :: "AGT-2 keeps the version label after the agent is renamed"

### Requirement: AGT-3 Another account's agent is hidden
A request for another account's agent id SHALL return 404 for the whole response and SHALL NOT include this account's agent names.

#### Scenario: Foreign id
- **WHEN** the caller requests another account's agent id
- **THEN** the status is 404 and the body does not contain this account's agent name

Trace: apps/api/src/features/evaluation/agents.integration.test.ts :: "AGT-3 hides another account without listing local agents"

### Requirement: AGT-4 View and curate stay separate
A false canView permission SHALL return 403 and SHALL NOT look like an empty list. A false canCurate permission SHALL reject create and SHALL NOT write a row. Reading SHALL succeed when canView is true.

#### Scenario: Forbidden is not empty
- **WHEN** canView is false
- **THEN** the screen shows a forbidden status and no agent name

#### Scenario: Curate is separate
- **WHEN** canCurate is false and canView is true
- **THEN** the list still loads and a create returns 403

Trace: apps/api/src/features/evaluation/agents.integration.test.ts :: "AGT-4 separates view from curate"

### Requirement: AGT-5 The agent screen shows its state
The screen SHALL show loading, empty, error, and success. A validation error SHALL name the field and move focus to it. Keyboard focus SHALL reach the name field. A narrow viewport SHALL stack the version detail under the agent list.

#### Scenario: Empty catalog
- **WHEN** the account has no agents
- **THEN** an empty status says there are no agents

#### Scenario: Keyboard
- **WHEN** the user tabs from the list to the name field
- **THEN** focus lands on the name field

Trace: apps/web/src/features/evaluation/agents.test.tsx :: "AGT-5 shows an empty catalog and keeps focus on the name"
