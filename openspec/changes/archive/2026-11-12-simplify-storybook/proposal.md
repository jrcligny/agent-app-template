# Proposal

## Why

After the app is only Hello world, the shared components still need a place to be seen. Storybook is that place. Demo screens are not. This change specifies which components stay as stories and which leave. It does not delete files.

## What Changes

- Every remaining shared component has a story, autodocs, and a link to its requirement id.
- The toolbar theme uses the same Cyan-Teal light and dark tokens as the app.
- Domain screens are not stories. Domain components that are not reusable primitives are removed rather than kept as stories.
- Button, field, status, progress, card, action row, theme menu, data table, wizard frame, drawer, and confirm dialog stay as stories.

## Capabilities

### New Capabilities

- `storybook-catalog`: the required stories and the theme toolbar.
- `storybook-patterns`: generic contracts for the table, wizard frame, drawer, and confirm dialog once the record product is gone.

### Modified Capabilities

- None. Record-specific requirements are removed in `simplify-demo-product`.

## Impact

- Depends on the hello shell for the product decision, and on the demo-product removal so record APIs are not required by the stories.
- Storybook stays a CI artifact. Publishing it is still not enabled.
- Implementation updates the coverage map when files are deleted. This pull request does not.

## User journey

A person opens Storybook, switches Light and Dark, and reads Button, Theme, Data table, Wizard, Drawer, and Confirm. Each docs page links the requirement id. They do not find a records page, a snapshot coverage table, or a hierarchy path.

## UI acceptance

Stories show loading, empty, error, and success where the component has those states. Validation and permission copy stays in the component, not in a demo page. Keyboard focus is covered for the dialog and the drawer. A narrow story still renders the control.

## Approval

`x-human-approval` is `pending`. This note is not a GitHub review.

## Breaking changes

None in this spec pull request. Removing a story is **BREAKING** for that docs page only when the demo-product increment is implemented.
