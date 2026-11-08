# workbench-shell Specification

## Purpose
Gives a signed-in person a dashboard with two defined counts and a forbidden state that is not the same thing as zero records.

## Requirements

### Requirement: WB-1 Dashboard shows all and open counts
The dashboard SHALL show two labeled counts for records the signed-in person can read: all of those records, and the subset whose status is open. Each label SHALL state that definition. A successful query SHALL use zero when the defined set is empty. A failed query SHALL NOT show zero.

#### Scenario: Both counts succeed
- **WHEN** the person can read 4 records and exactly 1 is open, and the request succeeds
- **THEN** the all-records count is 4 and the open-records count is 1
- **AND** each label states its definition
- **AND** each count is a keyboard link to the table

#### Scenario: Zero is a successful empty set
- **WHEN** the request succeeds and the person can read records but none are open
- **THEN** the open count is zero and an empty status says that zero means no open records

#### Scenario: Loading
- **WHEN** the dashboard request is in flight
- **THEN** a loading status is shown instead of numbers

#### Scenario: Unknown after failure
- **WHEN** the dashboard request fails
- **THEN** the counts are not shown as zero and an error status offers retry

Trace: apps/web/src/features/workbench/dashboard.integration.test.tsx :: "WB-1 distinguishes all records, open records, zero, and unknown"

### Requirement: WB-2 Forbidden is not an empty list
A signed-in person who lacks permission to view records SHALL see a permission error and SHALL NOT see record titles or a zero count.

#### Scenario: Permission denied
- **WHEN** the session is signed in but is not allowed to view records
- **THEN** the screen shows a forbidden status, no record title, and no numeric zero

Trace: apps/api/src/features/records/records.integration.test.ts :: "WB-2 rejects a session that is not allowed to list records"

### Requirement: SHELL-1 Header omits API status
The signed-in header SHALL NOT show API liveness text. `GET /api/health` and `GET /api/health/ready` SHALL remain available for probes. A narrow header SHALL still show the product name.

#### Scenario: Signed-in header
- **WHEN** the header renders for a signed-in person
- **THEN** it does not contain API status text
- **AND** the product name and account remain visible

Trace: apps/web/src/components/layout/app-shell.test.tsx :: "header does not show API status"
