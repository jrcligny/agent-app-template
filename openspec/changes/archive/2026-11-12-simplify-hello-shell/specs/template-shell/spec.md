# Spec Delta

## Purpose

Defines the only screen of the simplified template: Hello world, theme, and sign-in.

## ADDED Requirements

### Requirement: HELLO-1 The signed-in page says Hello world
The signed-in page SHALL show the words Hello world and SHALL NOT offer Dashboard, Records, Collections, Analytics, Activity, Settings, Notes, Wizard, or Jobs. A loading status SHALL show while the session is checked. An error status SHALL show when that check fails. There SHALL be no empty business list on this page.

#### Scenario: Signed in
- **WHEN** a person is signed in
- **THEN** the page shows Hello world and does not show a record table

#### Scenario: Loading
- **WHEN** the session check is in flight
- **THEN** a loading status is shown instead of Hello world

Trace: apps/web/src/features/hello/hello.test.tsx :: "HELLO-1 shows Hello world and no business navigation"

### Requirement: HELLO-2 Sign-in stays in front of the page
A signed-out person SHALL see the account form and SHALL NOT see Hello world. An empty email or password SHALL be a validation error and SHALL move focus to that field. A rejected sign-in SHALL show an error status. A successful sign-in SHALL show Hello world. A false permission is not used; there is no record permission.

#### Scenario: Signed out
- **WHEN** no session is present
- **THEN** the account form is shown and Hello world is not

#### Scenario: Keyboard
- **WHEN** the person submits an empty password from the keyboard
- **THEN** focus stays on the password field and no session is created

Trace: apps/web/src/features/auth/auth-panel.test.tsx :: "HELLO-2 keeps focus on an empty password"

### Requirement: HELLO-3 The header keeps theme and account
The header SHALL include the theme menu for Light, Dark, and System, and SHALL keep the Cyan-Teal tokens. A narrow viewport SHALL keep Sign out visible. The header SHALL NOT show API liveness text.

#### Scenario: Narrow header
- **WHEN** the viewport is narrow
- **THEN** the theme control and Sign out remain visible

#### Scenario: Success
- **WHEN** the person chooses Dark
- **THEN** the page uses the dark theme and a success state is not required beyond the menu check

Trace: e2e/tests/hello-theme.spec.ts :: "HELLO-3 switches theme on the Hello world page"
