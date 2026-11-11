# Proposal

## Why

The demo still presents generic records and collections. The owner wants an internal product for an ML team that evaluates AI agents by running evaluation campaigns. This change specifies the catalog those campaigns bind to: agents, immutable versions, and frozen test suites made of cases. It does not implement the product.

## What Changes

- Add agents and immutable agent versions.
- Add test suites and published suite versions that freeze cases.
- A case stores input, expected outcome, a scoring rule, and a pass threshold. It does not store a trace, a cost, a latency, or a human review.
- Replace the primary navigation with Campaigns, Agents, Suites, Activity, and Settings when this increment is implemented. That header change is **BREAKING** relative to the generic six-item workbench.
- Demo seed only. No model provider and no CI pipeline.
- No removals of archived requirement text in this spec pull request. Archiving stays in the implementation pull request, after the code matches.

## Capabilities

### New Capabilities

- `evaluation-navigation`: the five primary destinations and the flows that stay off the header.
- `evaluation-agents`: agents and immutable versions, including owner isolation.
- `evaluation-suites`: frozen suite versions and cases.
- `evaluation-demo-catalog`: the English catalog seed.

### Modified Capabilities

- None. Existing record, collection, and observation requirements stay the implemented baseline until a later implementation archives a replacement. This change does not edit `document-existing-components`.

## Impact

- New tables only. Record tables stay. Migrations remain forward-only.
- `document-existing-components` stays pending. Its shared-control, theme, image, and pipeline requirements still cover those components. Its header requirement (Dashboard, Records, Collections, Analytics) is the generic workbench, not this product. A person accepts or withdraws that change separately. Accepting this change does not approve that one.
- Implementation of EVAL-1 updates the coverage map so the shell cites EVAL-1. This spec pull request does not change that map and does not add application code.

## User journey

An ML engineer opens Agents and creates Harbor support, then adds version 1.2.0. They open Suites, draft Support regression, add cases with an input, an expected outcome, a scoring rule, and a threshold, and publish version 3. The published cases do not change when the draft changes. Campaigns is present and empty until the campaign increment. Activity and Settings remain available. Notes, a wizard, and jobs are not in the header.

## UI acceptance

Loading, empty, error, success, validation, and permission each have their own status. Keyboard focus can reach the name field. A narrow viewport stacks the detail under the list. Pass and fail colors are not part of this increment.

## Increments

This pull request splits the product into four changes. Each stays `x-human-approval: pending` and can be accepted on its own, in this order:

1. `add-evaluation-catalog` (this change): agents, versions, frozen suites, cases, navigation, catalog seed.
2. `add-evaluation-campaigns`: launch a campaign, follow the demo job, inspect a case result.
3. `add-evaluation-baseline`: compare with the pinned baseline and record a promotion decision.
4. `add-evaluation-monitoring`: campaign home, saved views, tags, pass-rate chart, activity wording.

## Approval

`x-human-approval` is `pending`. This note is not a GitHub review and it does not name a person as having approved the text.

## Breaking changes

The primary navigation change is **BREAKING** when EVAL-1 is implemented. This spec pull request does not archive, so the current baseline specs stay in place until that implementation.
