# Proposal

## Why

The person asked on 2026-11-08 for the whole interface to use one cyan-teal palette in light and dark, with accessible text where the exact cyan cannot carry the words. This change records that request. It does not rewrite earlier archived revisions.

## What Changes

- Use `#06B6D4` as the accent in both themes.
- Light canvas `#F0FDFA`, text `#0F172A`, cards white. Dark canvas `#0F172A`, text `#F8FAFC`, surfaces `#1E293B`.
- Put `#0F172A` on primary buttons. Keep cyan text for dark secondary controls, where it clears AA.
- Persist light, dark, or system, and apply the choice before first paint.
- Remove the green success colors.
- No removals of behavior. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `color-theme`: shared tokens, contrast exceptions, and the theme control.

### Modified Capabilities

- None.

## Impact

- Shared controls, charts, Storybook, and the docs theme read the same hues.
- One component test stores the choice. One script checks the contrast pairs.

## User journey

A person opens the app in the system theme. They choose Dark, reload, and the dark surfaces remain. Primary buttons stay cyan with dark text. Links on a light page stay slate with a cyan underline. A success message is readable without green.

## UI acceptance

Loading, empty, error, success, validation, and permission states keep their words. Keyboard and focus can reach the theme control. A narrow header wraps it. The focus ring is not cyan alone on the light background.

## Approval

The person requested this palette in the implementation session on 2026-11-08 and said not to add another approval blocker. `x-human-approval` stays `pending` because that field cannot name the person or a decision made outside a GitHub review. This note is not a GitHub review.

## Breaking changes

None.
