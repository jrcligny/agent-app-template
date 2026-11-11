# Spec Delta

## Purpose

Makes the campaign list the signed-in home instead of a count of generic records.

## ADDED Requirements

### Requirement: HOME-1 Campaigns is the home
The signed-in home SHALL list campaigns and SHALL NOT show a count of open records. A running campaign SHALL show its completed count and total. The list SHALL show loading, empty, error, and success.

#### Scenario: Empty home
- **WHEN** the account has no campaigns
- **THEN** an empty status says there are no campaigns

#### Scenario: Running progress
- **WHEN** Harbor 1.3.1 is running with one scored case
- **THEN** the row shows 1 of 4 and the word Running

Trace: apps/web/src/features/evaluation/home.test.tsx :: "HOME-1 lists campaigns instead of open records"

### Requirement: HOME-2 Filters stay in the address
The home SHALL filter by status, agent, and tag from the address. Keyboard focus SHALL remain on the filter after a change. A narrow viewport SHALL keep the table available. A false canView permission SHALL be a forbidden status, not an empty list.

#### Scenario: Status filter
- **WHEN** the address says status running
- **THEN** only running campaigns are listed

Trace: apps/web/src/features/evaluation/home.test.tsx :: "HOME-2 keeps the running filter in the address"
