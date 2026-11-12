# workbench-navigation

## Purpose

States the primary destinations of the workbench and which tools stay inside a record flow.

## ADDED Requirements

### Requirement: NAV-1 Primary navigation is the workbench
The signed-in header SHALL offer Dashboard, Records, Collections, Analytics, Activity, and Settings. It SHALL NOT offer Notes, Wizard, or Jobs as primary items. New record SHALL open the guided create. The full form and Export SHALL stay on Records. Evidence SHALL stay on the record. Notes SHALL remain at `/notes` for the account slice.

#### Scenario: Header lists the workbench
- **WHEN** a person is signed in
- **THEN** the primary navigation shows those six items and not Notes

#### Scenario: Narrow header
- **WHEN** the viewport is narrow
- **THEN** the same items remain available and the theme button stays in the header

Trace: e2e/tests/theme.spec.ts :: "theme choice persists and charts stay labeled in light and dark"
