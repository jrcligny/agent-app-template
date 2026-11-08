# Spec Delta

## Purpose

Lets a person save a display name and a table page size, and warns before leaving unsaved settings.

## ADDED Requirements

### Requirement: SET-1 Settings save and unsaved warning
Settings SHALL accept a non-empty display name and a page size of 10, 25, or 50. Leaving with edits SHALL ask for confirmation. A narrow viewport SHALL keep the save action visible.

#### Scenario: Validation
- **WHEN** the user saves an empty display name
- **THEN** a validation error is shown and focus is on that field

#### Scenario: Success
- **WHEN** the user saves a valid page size
- **THEN** the next table request uses that page size and a success status is shown

#### Scenario: Narrow layout
- **WHEN** the viewport is narrow
- **THEN** the save action remains visible

Trace: apps/web/src/features/settings/settings.test.tsx :: "SET-1 validates the display name and keeps save visible when narrow"
