# workbench-shell Specification

## Purpose
Gives a signed-in person a dashboard with two defined counts and a forbidden state that is not the same thing as zero records.

## Requirements

### Requirement: SHELL-1 Header omits API status
The signed-in header SHALL NOT show API liveness text. `GET /api/health` and `GET /api/health/ready` SHALL remain available for probes. A narrow header SHALL still show the product name.

#### Scenario: Signed-in header
- **WHEN** the header renders for a signed-in person
- **THEN** it does not contain API status text
- **AND** the product name and account remain visible

Trace: apps/web/src/components/layout/app-shell.test.tsx :: "header does not show API status"
