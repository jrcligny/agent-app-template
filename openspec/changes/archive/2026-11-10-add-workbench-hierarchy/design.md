# Design

## Context

See proposal.md. The path is a navigation aid. It does not define a test, a run harness, or a score.

## Goals / Non-Goals

**Goals:**

- Collection contains snapshots. A snapshot contains items copied at publish. An item may contain zero or more attempts.
- An attempt is a generic child row with a label and a UTC time. It is optional.
- The URL keeps `collection`, `snapshot`, `item`, `attempt`, and the current filters.

**Non-Goals:**

- Requiring attempts on every item.
- Charts or coverage. Those are other increments.
- Implementing this change in the spec pull request.

## Decisions

- Back uses the browser history only when it stays inside this path. Otherwise a parent link is shown.
- Filters that were on the parent list remain in the URL.
- Another account's id is 404. Missing hierarchy permission is 403.

## Risks / Trade-offs

- [Deep links get long] → They are still the stable way to return to the same context.

## Migration Plan

Forward-only attempt rows. No destructive SQL.

## Open Questions

None required before review.
