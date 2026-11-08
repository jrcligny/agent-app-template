# record-table Specification

## Purpose
Lets a person find, order, page, select, and bulk-delete only their own synthetic records.

## Requirements

### Requirement: TBL-1 Search filter sort and pagination
The table SHALL accept a text search, a status filter, a sort, and a page size, and SHALL return only the caller's records.

#### Scenario: Filtered page
- **WHEN** the caller searches for a title, filters to open, sorts by title, and asks for page 1
- **THEN** the response contains only matching records they own, in that order, and a total count

#### Scenario: Empty
- **WHEN** the filter matches nothing
- **THEN** the table shows an empty status and the search field remains available

Trace: apps/api/src/features/records/records.integration.test.ts :: "TBL-1 returns the caller's filtered sorted page"

### Requirement: TBL-2 Selection and bulk delete
The table SHALL let the keyboard select rows and SHALL NOT delete them until confirmation succeeds. The delete itself follows CFM-1, including the rule that a mixed set deletes nothing.

#### Scenario: Selection
- **WHEN** the user toggles a row from the keyboard
- **THEN** that row is selected and the bulk action names the count

#### Scenario: Narrow layout
- **WHEN** the viewport is narrow
- **THEN** the search field and the bulk action stay on screen

Trace: apps/web/src/features/records/record-table.test.tsx :: "TBL-2 selects a row from the keyboard and keeps search visible when narrow"
