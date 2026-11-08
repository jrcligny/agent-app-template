# Proposal

## Why

The signed-in header showed API liveness as product copy, the wizard stated a step number without a progress bar, and shared buttons stretched to the width of a grid column. The person using this branch asked for those three behaviors on 2026-11-08. This change records that request. It does not rewrite earlier archived revisions.

## What Changes

- Remove API status text from the header. Keep `GET /api/health` and `GET /api/health/ready`.
- Show wizard progress as text plus a bar, with progressbar semantics for the current step.
- Place Back before Next or Finish in a right-aligned wrapping footer. Back stays secondary.
- Keep shared buttons at the width of their label. Right-align form, settings, confirmation, and table action groups.
- No removals of health probes. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `action-controls`: content-width buttons and right-aligned action groups.

### Modified Capabilities

- `workbench-shell`: the header does not show API status.
- `guided-wizard`: visible step progress and footer order.

## Impact

- Depends on the wizard from `add-workbench-operations`.
- One component test for progress and button width. The existing operations browser journey checks computed layout on a wide and a narrow viewport.

## User journey

A signed-in person looks at the header and does not see "API ok" or "Checking API". They open the wizard, read "Step 1 of 3. Current step: Record title.", and see a progress bar. Next sits at the right and is only as wide as its label. On the next step, Back is to the left of Next. On a narrow screen the pair wraps without leaving the viewport. An invalid step stays put and focus moves to the field. Finish still creates the record.

## UI acceptance

Loading, empty, error, success, validation, and permission states stay on the screens that already own them. Keyboard and focus still move to an invalid wizard field, and Back and Next remain buttons. A narrow viewport wraps the footer. Progress is text plus a bar, not color alone.

## Approval

The person requested this refinement in the implementation session on 2026-11-08 and said not to add another approval blocker. `x-human-approval` stays `pending` because that field cannot name the person or a decision made outside a GitHub review. This note is not a GitHub review. The spec check does not treat `pending` as failure.

## Breaking changes

None.
