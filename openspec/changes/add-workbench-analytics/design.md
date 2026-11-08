# Design

## Context

See proposal.md. Charts must not invent metrics the observation rows cannot support.

## Goals / Non-Goals

**Goals:**

- Persist `observed_at` as UTC.
- Bucket in the requested timezone. Display labels default to Europe/Paris.
- Publish one normative fixture so the integration test has exact totals.

**Non-Goals:**

- Forecasting, percentiles, or any metric not defined here.
- Comparing two snapshots. That is `add-workbench-comparison`.
- Implementing this change in the spec pull request.

## Decisions

- An observation has: id, owner, optional record id, category, status (`open` or `closed`), integer value, and `observed_at`.
- Fixture `alpha`, all owned by the caller:
  - `2026-01-15T10:00:00Z`, category `alpha`, status `open`, value 2
  - `2026-01-15T11:00:00Z`, category `alpha`, status `open`, value 3
  - `2026-01-15T23:30:00Z`, category `beta`, status `closed`, value 5
- Window `[2026-01-15T00:00:00Z, 2026-01-16T00:00:00Z)` in UTC contains all three. Count is 3. Sum of value is 10. Open count is 2. Closed count is 1.
- The same window bucketed by day in Europe/Paris places the `23:30Z` row on 16 January, because Paris is UTC+1 in January. The UTC day bucket places it on 15 January.
- A count series fills empty buckets with zero. A value series omits a bucket that has no observations. It does not draw a zero point.
- A previous window of equal length is the only baseline. If that window has no observations, the delta is unknown.
- Drill URL query is `status`, `category`, `from`, and `to`, matching the table.

## Risks / Trade-offs

- [Timezone mistakes] → The two bucket assertions above are the acceptance test, not a general calendar library claim.

## Migration Plan

Forward-only observation table. No destructive SQL.

## Open Questions

None required before review.
