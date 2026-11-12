# Proposal

## Why

The workbench already has shared controls, a primary navigation, images, and a chart. Those behaviors were not all named in a spec. This change records the behavior that is already built, including the header theme menu and the decision to keep notes off the primary navigation. It does not rewrite archived revisions.

## What Changes

- Describe the primary navigation and where create, export, evidence, and collections live.
- Describe shared controls at the behavior and accessibility level.
- Describe the theme menu, the non-root images, the scheduler guard, and the docs build.
- No removals. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `workbench-navigation`: the six primary destinations and the flows that are not top-level items.
- `shared-controls`: buttons, fields, status, progress, cards, and menus.
- `delivery-pipeline`: images, the Helm scheduler guard, checks, skills, and docs.

### Modified Capabilities

- `color-theme`: the theme control is a menu with the current choice checked.

## Impact

- A coverage check fails when a new component file has no requirement id.
- These specs stay pending until a person validates them. This proposal is not that validation.

## User journey

A person sees Dashboard, Records, Collections, Analytics, Activity, and Settings. New record starts the guided create from Records. Export is on the records toolbar. Evidence stays on the record. Notes stay available at their route and are not a primary item. The theme button opens Light, Dark, and System.

## UI acceptance

Loading, empty, error, success, validation, and permission keep their words. Keyboard and focus reach the theme menu and Escape closes it. A narrow header keeps the button at 44 pixels.

## Approval

`x-human-approval` is `pending`. The person asked for a coverage audit and a theme menu, and must still validate these written specs. That field cannot record the person or a decision made outside a GitHub review. This note is not a GitHub review.

## Breaking changes

None.
