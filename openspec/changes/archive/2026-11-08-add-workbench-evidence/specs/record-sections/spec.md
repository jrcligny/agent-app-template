# Spec Delta

## Purpose

Shows optional nested sections as a readable tree or table instead of a raw JSON string.

## ADDED Requirements

### Requirement: SEC-1 Sections are readable and optional
The detail screen SHALL show titled sections the record actually has, including input, context, or expected criteria when present. It SHALL NOT require those titles. Nested fields SHALL be expandable. Text SHALL be shown as text, not as HTML.

#### Scenario: Success
- **WHEN** a record has a context section with a nested field
- **THEN** the viewer shows the title and the nested field without requiring a raw JSON view

#### Scenario: Empty
- **WHEN** a record has no sections
- **THEN** an empty status says there are no sections

#### Scenario: Keyboard and focus
- **WHEN** the user expands a node from the keyboard
- **THEN** focus moves to that node and its children become available

#### Scenario: Narrow layout
- **WHEN** the viewport is narrow
- **THEN** section titles remain readable

Trace: apps/web/src/features/evidence/section-tree.test.tsx :: "SEC-1 expands a nested section from the keyboard"
