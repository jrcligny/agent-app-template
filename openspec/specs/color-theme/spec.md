# color-theme Specification

## Purpose
Keeps one cyan accent and slate surfaces across the app, and states which pairings are used because the others miss WCAG AA.

## Requirements

### Requirement: THEME-1 Choice persists and the system is the default
The app SHALL start from the system light or dark preference. A person SHALL be able to store light, dark, or system. The stored choice SHALL survive a reload. The control SHALL be keyboard reachable and SHALL remain available on a narrow header.

#### Scenario: Explicit dark survives reload
- **WHEN** the person chooses dark and reloads
- **THEN** the document theme is dark

#### Scenario: System follows the preference
- **WHEN** the stored choice is system and the system preference is dark
- **THEN** the document theme is dark

Trace: apps/web/src/components/theme/theme-switch.test.tsx :: "stores the chosen theme and follows the system again"
Trace: e2e/tests/theme.spec.ts :: "theme choice persists and charts stay labeled in light and dark"

### Requirement: THEME-2 Cyan stays exact and text uses a passing pair
The accent SHALL be `#06B6D4` in both themes. Primary button text SHALL be `#0F172A`. Light body text SHALL be `#0F172A` on `#F0FDFA` and white cards. Dark body text SHALL be `#F8FAFC` on `#0F172A` and `#1E293B`.

#### Scenario: Approved pairs are the ones rendered
- **WHEN** the contrast check reads the stylesheet
- **THEN** the approved cyan and slate colors are present
- **AND** white on cyan and cyan on the light canvas are below AA and are not the text colors

Trace: scripts/contrast.test.mjs :: "critical pairs meet AA, and the rejected cyan text pairs do not"

### Requirement: THEME-3 Light secondary text is slate
On the light theme, links and secondary buttons SHALL use `#0F172A` text. Cyan MAY appear as an underline, border, or highlight. The light focus indicator SHALL be `#0F172A`. Success SHALL NOT use a green palette. Loading, empty, error, validation, and permission states SHALL keep their words.

#### Scenario: Light focus is not cyan alone
- **WHEN** the light theme is active
- **THEN** the focus color is `#0F172A`

Trace: scripts/contrast.test.mjs :: "the stylesheet keeps the approved cyan and slate colors"
