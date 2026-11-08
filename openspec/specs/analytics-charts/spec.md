# analytics-charts Specification

## Purpose
Shows defined counters and series with a text table, and drills to the record table without inventing points.

## Requirements

### Requirement: AN-1 Zero, unknown, and no observations
A successful aggregate of zero SHALL show zero. A failed or forbidden request SHALL show unknown and SHALL NOT show zero. A value series SHALL omit buckets that have no observations. A count series SHALL use zero for an empty bucket inside the requested window.

#### Scenario: Zero is a successful empty count
- **WHEN** the request succeeds and no observation matches
- **THEN** a count counter shows zero and an empty status says there are no observations in the window

#### Scenario: Unknown after failure
- **WHEN** the request fails
- **THEN** the counter shows unknown, not zero, and an error status offers retry

#### Scenario: Loading
- **WHEN** the analytics request is in flight
- **THEN** a loading status is shown instead of numbers

#### Scenario: Permission
- **WHEN** the session is not allowed to read observations
- **THEN** the screen shows a forbidden status and unknown, not zero

Trace: apps/api/src/features/analytics/analytics.integration.test.ts :: "AN-1 returns zero only for a successful empty count"

### Requirement: AN-2 Charts have a text equivalent and drill through
The screen SHALL show a daily count series and bars by status or category, plus a table of the same numbers. Activating a bar or a point from the keyboard SHALL open the record table with `status`, `category`, `from`, and `to` preserved. Color SHALL NOT be the only means of telling series apart.

#### Scenario: Keyboard drill
- **WHEN** the user focuses a status bar and activates it
- **THEN** focus can reach that bar without a pointer
- **AND** the table URL contains that status and the current window

#### Scenario: Narrow layout
- **WHEN** the viewport is narrow
- **THEN** the data table remains available

#### Scenario: Success
- **WHEN** the fixture window loads
- **THEN** a success status shows the defined totals and the table matches the chart

Trace: apps/web/src/features/analytics/analytics-chart.test.tsx :: "AN-2 drills from the keyboard and keeps the data table when narrow"

### Requirement: AN-3 A window must be ordered
The API SHALL reject a window whose start is not before its end.

#### Scenario: Validation
- **WHEN** `from` is not before `to`
- **THEN** the response is a validation error and the screen shows an error status

Trace: apps/api/src/features/analytics/analytics.integration.test.ts :: "AN-3 rejects a window whose start is not before its end"
