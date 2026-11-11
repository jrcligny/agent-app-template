# Spec Delta

## Purpose

Names the primary destinations of the evaluation product and keeps launch, jobs, and notes out of the header.

## ADDED Requirements

### Requirement: EVAL-1 The header is the evaluation product
The signed-in header SHALL offer Campaigns, Agents, Suites, Activity, and Settings. It SHALL NOT offer Dashboard, Records, Collections, Analytics, Notes, Wizard, or Jobs as primary items.

#### Scenario: Header lists the product
- **WHEN** a person is signed in
- **THEN** the primary navigation shows those five items and does not show Records

#### Scenario: Narrow header
- **WHEN** the viewport is narrow
- **THEN** those items remain available and the theme control stays in the header

Trace: e2e/tests/evaluation-nav.spec.ts :: "EVAL-1 shows Campaigns, Agents, Suites, Activity, and Settings"
