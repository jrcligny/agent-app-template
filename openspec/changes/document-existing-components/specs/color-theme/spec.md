# color-theme

## ADDED Requirements

### Requirement: THEME-4 The theme menu states the current choice
The header SHALL use one 44 pixel button labeled Color theme. Activating it SHALL open a menu of Light, Dark, and System. The current choice SHALL be checked. Escape SHALL close the menu and return focus to the button. The choice SHALL persist, and system SHALL remain the default.

#### Scenario: Menu shows the check
- **WHEN** the person opens the theme menu after choosing dark
- **THEN** Dark is checked and Light and System are not

#### Scenario: Escape closes the menu
- **WHEN** the menu is open and the person presses Escape
- **THEN** the menu closes and focus returns to the theme button

Trace: apps/web/src/components/theme/theme-switch.test.tsx :: "stores the chosen theme and follows the system again"
