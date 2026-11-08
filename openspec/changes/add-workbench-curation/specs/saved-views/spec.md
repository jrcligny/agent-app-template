# Spec Delta

## Purpose

Lets a person reopen the same multi-criteria filter from a URL or a named view.

## ADDED Requirements

### Requirement: VIEW-1 Filters live in the URL
The table SHALL read `q`, `status`, `tag`, `collection`, `sort`, and `page` from the URL and SHALL restore them when that URL is opened again.

#### Scenario: Shared URL
- **WHEN** the user opens a URL that sets status to open and a tag
- **THEN** the table shows only the caller's matching records and those controls show the same values

#### Scenario: Empty
- **WHEN** the URL filter matches nothing
- **THEN** an empty status is shown and the filter controls remain available

Trace: apps/web/src/features/curation/saved-view.test.tsx :: "VIEW-1 restores status and tag from the URL"

### Requirement: VIEW-2 A named view stores the query
Saving a view SHALL require a name and SHALL navigate back to the stored query. A session without permission SHALL see a forbidden status.

#### Scenario: Success
- **WHEN** the user saves the current URL query under a name
- **THEN** opening that view returns to the same query and a success status is shown

#### Scenario: Validation
- **WHEN** the user saves a view with an empty name
- **THEN** a validation error is shown and focus is on the name field

#### Scenario: Permission
- **WHEN** the session is not allowed to save views
- **THEN** the screen shows a forbidden status and no view is stored

Trace: apps/api/src/features/curation/views.integration.test.ts :: "VIEW-2 stores a named query and rejects an empty name"
