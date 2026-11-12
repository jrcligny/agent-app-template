# Proposal

## Why

The template currently boots a full demo workbench. The owner wants a small starting point: a Hello world page, the theme control, and sign-in. Business screens are no longer part of the product. This change specifies that shell. It does not delete code.

## What Changes

- The signed-in page shows Hello world and nothing else.
- The header keeps the product name, the theme menu, and the account. It does not list Dashboard, Records, Collections, Analytics, Activity, Settings, Notes, Wizard, or Jobs.
- Sign-in stays. A person who is signed out sees the account form, not a business screen.
- Dashboard counts and the settings page leave the product. That navigation change is **BREAKING** when this increment is implemented.
- No application code in this pull request. No archive.

## Capabilities

### New Capabilities

- `template-shell`: the Hello world page, the reduced header, and sign-in.

### Modified Capabilities

- `workbench-shell`: remove the dashboard counts and the forbidden-records state. Keep the header rule that hides API liveness.
- `workbench-settings`: remove the settings page.

## Impact

- Routes for the demo screens are specified as gone in `simplify-demo-product`. This change only defines the page that remains.
- `document-existing-components` stays pending and is not edited. Its shared-control and theme-menu requirements still cover those components. Its header requirement that lists the six business sections is not the target. Accepting this change does not approve that pending change.
- Theme tokens stay Cyan-Teal. Pass and fail colors are not introduced.

## User journey

A person opens the app, creates an account, and sees Hello world. They switch Light, Dark, or System. They sign out and see the account form again. They never see a record, a collection, or a chart.

## UI acceptance

Loading, empty, error, success, validation, and permission each use words. Keyboard focus reaches the theme menu and the account fields. A narrow header keeps the theme control and does not clip Sign out.

## Increments

1. `simplify-hello-shell` (this change): the page and the header.
2. `simplify-storybook`: Storybook is how a person browses the remaining components.
3. `simplify-demo-product`: remove demo APIs, tables, and routes.
4. `simplify-delivery`: adapt images, Helm, CI, and docs to that smaller surface.

## Approval

`x-human-approval` is `pending`. This note is not a GitHub review.

## Breaking changes

Removing the dashboard and the settings page is **BREAKING** when implemented. This spec pull request does not archive, so the current baseline stays until that implementation.
