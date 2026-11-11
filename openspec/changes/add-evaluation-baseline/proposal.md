# Proposal

## Why

A finished campaign still does not say whether the version is better than the one the team already trusts. This change specifies a single baseline pin, a worded comparison, and an explicit promotion decision. It does not implement them, and it does not deploy anything.

## What Changes

- An agent has at most one baseline, which is a promoted campaign id, or none.
- Comparison labels each case added, removed, improved, regressed, or unchanged.
- A missing result stays Not run. It is not a zero and it is not a regression.
- Promotion requires a complete campaign, every case passing, and no regression. The person confirms. A first version with no baseline may be promoted when every case passes.
- Promotion does not start a pipeline.

## Capabilities

### New Capabilities

- `evaluation-baseline`: the pin, the comparison words, and the promotion rule.

### Modified Capabilities

- None.

## Impact

- Depends on `add-evaluation-campaigns`.
- Reuses the diff table and the confirm dialog. No new permission flag.

## User journey

The engineer opens Harbor 1.3.0 support check, which is complete and has one failed case. Comparison against the Harbor 1.2.0 baseline shows Refund over the limit as regressed, in words. Promote stays unavailable. Field notes 0.9.0 summary has no baseline and every case passes, so Promote is available. Confirming it pins that campaign as the baseline. Nothing is deployed.

## UI acceptance

Loading, empty, error, success, validation, and permission are separate. The confirm dialog is keyboard reachable and returns focus when dismissed. A narrow viewport keeps the comparison table. Regressed and improved are words, not color alone.

## Approval

`x-human-approval` is `pending`. This note is not a GitHub review.

## Breaking changes

None.
