# Proposal

## Why

A catalog of agents and suites is not yet a campaign. The team needs to launch one agent version against one frozen suite version, watch the demo run, and open a failing case. This change specifies that run. It does not implement it.

## What Changes

- A campaign binds one agent version and one published suite version.
- A demo job writes seeded scores. It does not call a model or a CI pipeline.
- Each case ends as Pass, Fail, or Not run. A missing score is not zero. Color is not the only signal.
- The address keeps the campaign, the case, and the outcome filter. Back returns to that filter.

## Capabilities

### New Capabilities

- `evaluation-campaigns`: launch, status, and deterministic demo scores.
- `evaluation-case-results`: pass, fail, and not run, plus the case path.

### Modified Capabilities

- None.

## Impact

- Depends on `add-evaluation-catalog`.
- Reuses the wizard, the in-process job, and the master-detail path. It does not add a primary nav item.
- No external evaluator.

## User journey

From Campaigns, the engineer starts Launch. The wizard asks for an agent version, a published suite version, and a name, then reviews the choice. Harbor 1.3.1 support check starts running and shows 1 of 4 cases scored. Opening Delayed package shows Pass and the frozen input. Cases without a result say Not run. Back returns to the list with the same outcome filter.

## UI acceptance

The wizard shows step text, keeps Back before Next, and validates before the next step. The campaign shows loading, empty, error, success, validation, and permission. Keyboard focus returns to the case list. A narrow viewport stacks the case under the list. Pass, Fail, and Not run are words.

## Approval

`x-human-approval` is `pending`. This note is not a GitHub review.

## Breaking changes

None beyond the catalog increment's navigation. Launch does not add a header item.
