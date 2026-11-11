# Design

## Context

See proposal.md. The implemented baseline is a generic workbench: records, collections, observations, snapshots, and a six-item header. `document-existing-components` is still pending and is not edited here. Shared controls, the theme menu, images, and the pipeline stay covered by that pending change and by the archived control specs.

## Goals / Non-Goals

**Goals:**

- Name the smallest set of entities an evaluation campaign needs.
- Freeze suite cases the same way a snapshot freezes copied fields.
- Keep owner isolation all-or-nothing and keep canView separate from canCurate.
- Define the header and the component map for the whole product, including later increments.

**Non-Goals:**

- Launching a campaign, scoring, comparison, or promotion. Those are the next changes.
- CI pipelines, model providers, traces, cost, latency, and human review.
- Dropping record tables. Destructive SQL stays forbidden.
- Approving or archiving `document-existing-components`.

## Decisions

- **Agent.** The team evaluates a named system. Without an agent, versions and campaigns have no product to attach to. The name can change. History does not follow the name.
- **Agent version.** A campaign must bind a label that does not move. A new label is a new row. The alternative, overwriting one mutable version, would rewrite old campaigns.
- **Test suite.** Cases share a product name (Support regression) that can be renamed. The suite is that name. It is not a campaign and it is not a score.
- **Suite version.** Publish copies input, expected outcome, scoring rule, and threshold. Later draft edits must not change a campaign that already bound the version. This replaces collection snapshots for this product. A suite version is not a quality score.
- **Case.** One input, one expected outcome, one scoring rule, one threshold. That is the owner's scope. Exact accepts only 0 or 1. Numeric compares a score with a threshold from 0 to 1 inclusive. No trace, cost, latency, or review column.
- **Why there is no baseline entity yet.** The pin is one campaign id on the agent. It is specified in `add-evaluation-baseline`, not as a second aggregate here.
- **Navigation.** Campaigns, Agents, Suites, Activity, Settings. Launch, jobs, case evidence, and charts stay inside those sections. Notes are not a product surface. The pending header spec that lists Dashboard and Records is superseded for this product only after a person accepts EVAL-1. Until then both texts exist, and neither approval is implied.
- **Demo data.** Seed rows only. English names are specified in DEMO-1. Scores are specified in the campaign change so this change can land without a runner.
- **Component map.** See the table below. Implementation updates `coverage.map.json` when a screen starts citing a new requirement. This spec pull request does not edit the map, so current components stay covered by their current headings.

| Existing piece | Decision |
| --- | --- |
| App shell and theme menu | Reuse. Header links change under EVAL-1. Theme behavior stays. |
| Buttons, fields, status, cards, progress, action row | Reuse unchanged. Pass and fail are words on top of status, not a green token. |
| Wizard | Rework in the campaign increment into Launch. Same progress text, Back then Next, content-width buttons. |
| Jobs | Rework in the campaign increment into the demo scorer. Same progress, cancel, and retry rules. Not a CI runner. |
| Activity | Reuse the list. Wording changes in the monitoring increment. |
| Charts and time windows | Rework in the monitoring increment to pass rate. Keep the table, zero versus unknown, UTC windows, and Europe/Paris labels. |
| Tags, saved views, bulk edits | Rework in the monitoring increment onto agents, suites, and campaign filters. No bulk delete. |
| Sections and attachments | Drop from the product. Case input and expected outcome are fields, not a file gallery. Do not build a new uploader. |
| Snapshots and coverage taxonomy | Drop as a user-facing collection publish. Suite versions take the freeze behavior. Do not show a category coverage score. |
| Comparison | Rework in the baseline increment. Words name improved, regressed, and unchanged. Same all-or-nothing 404. |
| Hierarchy | Rework in the campaign increment to campaign, case, and result. Back keeps the outcome filter. A result count is not a quality score. |
| Dialogs and drawers | Reuse. Promote uses a confirm dialog. A case opens in a drawer and on a full page. |
| Notes and the generic record form | Drop from the product navigation. Archived note and record requirements stay until an implementation explicitly removes them. |
| New pieces | Agent, agent version, suite, suite version, case, and the catalog seed. Campaign, case result, baseline pin, and pass rate arrive in later changes. |

## Risks / Trade-offs

- [Two header specs exist until the owner decides] → This change does not edit the pending navigation change. EVAL-1 is the product text. The pending change is not approved by this proposal.
- [Old tables remain] → Forward-only migrations cannot drop them. They become unused demo tables, not a second product in the header.
- [Exact is not executed] → The demo job writes a seeded score. The rule only constrains which scores are legal. Computing exact from text is an open question.

## Migration Plan

Add tables for agents, versions, suites, suite versions, and cases. Do not drop record, note, or snapshot tables in this increment. Rollback is to leave the new routes unlinked. No deploy and no archive in the spec pull request.

Dependency direction stays as it is now: HTTP handlers parse, a service outside the feature folder owns the rules, and the web feature does not import another feature.

## Open Questions

These are guesses. The requirements above use them so the text is testable. A different answer changes the spec before implementation.

1. Is a score always from 0 to 1 inclusive?
2. Are exact and numeric the only scoring rules?
3. Should the demo job ever compare outcome text, or only replay seeded scores?
4. Is one baseline pin per agent enough, or must any two campaigns be comparable? The baseline change allows both a pin and a chosen pair. Confirm that pair.
5. Does any regression block promotion, even when the new score still passes?
6. Is a score equal to the threshold a pass?
7. Does Settings stay in the header?
8. Are notes removed from the product, or kept as a private scratch pad?
9. May a published suite version be edited, or is a new version required? This design requires a new version.
10. Must an agent version label be unique per agent?
11. Is canCurate the right gate for publish and promote, with no new permission?
12. Does a campaign bind exactly one suite version?
13. May a completed campaign contain Not run? This design says no. A running campaign may.
14. Are the English seed names acceptable, or should the fiction change?
