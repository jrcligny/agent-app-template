# Design

## Context

See proposal.md and `add-evaluation-catalog` for the entity list and the component map. This change fills Campaigns.

## Goals / Non-Goals

**Goals:**

- One campaign is one agent version plus one published suite version.
- The demo job replays CAMP-4 scores and derives Pass or Fail from the threshold.
- The case path keeps the outcome filter.

**Non-Goals:**

- A model call, a trace, or a CI pipeline.
- Promotion and baseline comparison.
- Pass-rate charts.

## Decisions

- The wizard steps are agent version, suite version, name, and review. Empty name blocks Next and moves focus to the field.
- The job is the existing in-process scheduler. It writes seeded rows. It does not interpret case text. Cancel and retry follow the current job rules: retry starts a new attempt and writes the same scores.
- Not run means no result row. The UI must not substitute 0.
- Breadcrumbs are Campaigns / campaign name / case name. Back drops the case id and keeps the outcome filter.
- Another account is 404 for the whole body, checked before any case input is loaded.

## Risks / Trade-offs

- [Seeded scores can drift from the written rule] → CAMP-4 lists every score, and exact rejects any score other than 0 or 1.
- [A running campaign looks unfinished] → Harbor 1.3.1 is specified as 1 of 4 so the live state is testable.

## Migration Plan

Add campaign and case-result tables. Results reference the frozen case id, not the live draft. No drop of older tables. Rollback leaves the campaign route unlinked.

## Open Questions

See the catalog design. This increment additionally assumes a completed campaign cannot contain Not run, and that retry does not invent new scores.
