# Spec Delta

## Purpose

Shows pass rate for completed campaigns as a chart and a table, without treating a running run as zero.

## ADDED Requirements

### Requirement: RATE-1 The chart has the same numbers as the table
A pass-rate chart SHALL have a table of the same campaign names and rates. The series SHALL NOT be green and SHALL NOT be the only statement of the number. Keyboard focus SHALL reach the table links.

#### Scenario: Table matches the chart
- **WHEN** the chart shows a completed campaign
- **THEN** the table shows that campaign's pass count and case count

Trace: apps/web/src/features/evaluation/pass-rate.test.tsx :: "RATE-1 repeats the pass rate in a table"

### Requirement: RATE-2 Zero and unknown stay distinct
A window with no completed campaigns SHALL show a count of zero. A running campaign SHALL be omitted and SHALL NOT be drawn as a zero pass rate. A campaign with no pass and no fail SHALL NOT be labeled zero.

#### Scenario: Empty window
- **WHEN** the window contains no completed campaign
- **THEN** the status shows count 0

#### Scenario: Running is omitted
- **WHEN** the only campaign in the window is running
- **THEN** the chart does not plot it as zero

Trace: apps/api/src/features/evaluation/pass-rate.integration.test.ts :: "RATE-2 omits a running campaign instead of plotting zero"

### Requirement: RATE-3 The window is explicit
The window SHALL be inclusive at the start and exclusive at the end, in UTC. Labels SHALL default to Europe/Paris. If the start is not before the end, the response SHALL be a validation error. A false canView permission SHALL be forbidden, not a zero.

#### Scenario: Unordered window
- **WHEN** the start is not before the end
- **THEN** the response is a validation error

#### Scenario: Narrow chart
- **WHEN** the viewport is narrow
- **THEN** the table remains available under the chart

Trace: apps/api/src/features/evaluation/pass-rate.integration.test.ts :: "RATE-3 rejects a window whose start is not before its end"
