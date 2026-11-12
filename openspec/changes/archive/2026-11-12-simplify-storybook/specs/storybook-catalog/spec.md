# Spec Delta

## Purpose

Makes Storybook the catalog of the template components that remain after the demo product is removed.

## ADDED Requirements

### Requirement: SB-1 Remaining components have stories
Each remaining shared component SHALL have a story with autodocs. The docs page SHALL link the requirement id and SHALL NOT paste the requirement prose. The story set SHALL include button, text field, select field, action row, card, status, progress, theme menu, data table, wizard frame, drawer, and confirm dialog.

#### Scenario: Button docs
- **WHEN** a person opens the button docs
- **THEN** the page links the button requirement and does not copy its scenario text

Trace: apps/web/src/components/ui/button.stories.tsx :: "SB-1 links the button docs to the requirement id"

### Requirement: SB-2 The toolbar uses the app theme
The Storybook toolbar SHALL switch Light and Dark with the same Cyan-Teal tokens as the app. A story SHALL NOT reset the canvas to the system theme while a toolbar choice is set.

#### Scenario: Dark toolbar
- **WHEN** the toolbar choice is Dark
- **THEN** the story canvas uses the dark theme tokens

Trace: apps/web/.storybook/preview.tsx :: "SB-2 keeps the toolbar theme on the canvas"

### Requirement: SB-3 Removed domain components are not stories
The catalog SHALL NOT include a story for the curation panel, evidence panel, section tree, coverage table, diff table, or hierarchy path. Those components are removed with the demo product, not kept as stories.

#### Scenario: No hierarchy story
- **WHEN** the Storybook index is built
- **THEN** it does not contain a hierarchy path story

Trace: apps/web/.storybook/main.ts :: "SB-3 omits demo-only component stories"
