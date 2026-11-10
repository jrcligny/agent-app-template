# Design

## Context

See proposal.md. Comparison reads snapshots and observations. It does not edit them.

## Goals / Non-Goals

**Goals:**

- Identity of an observation instant is the UTC timestamp.
- Labels and buckets use the requested timezone. The default display zone is Europe/Paris.
- Diff rows are added, removed, or changed. Changed means a copied field differs.

**Non-Goals:**

- A domain-specific checklist of required metadata.
- Implementing this change in the spec pull request.

## Decisions

- A window is `[from, to)` in UTC.
- Granularity is `hour` or `day`.
- The observation at `2026-01-15T23:30:00Z` is 16 January 00:30 in Europe/Paris and stays 15 January in a UTC day bucket. This repeats the analytics fixture so both increments agree.
- Provenance fields are optional strings: environment name, config digest, and code version. The diff shows a field only when at least one side has a value.
- Another account's snapshot id is 404. Lacking comparison permission is 403 and the screen shows forbidden, not an empty diff.

## Risks / Trade-offs

- [DST] → The January instant is the normative example. The UTC instant remains the key if a local hour is skipped or repeated.

## Migration Plan

No new destructive SQL. Comparison can be computed from snapshot and observation tables.

## Open Questions

None required before review.
