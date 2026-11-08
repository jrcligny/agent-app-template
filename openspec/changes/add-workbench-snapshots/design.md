# Design

## Context

See proposal.md. Publish copies the member ids and the field values needed to redisplay them.

## Goals / Non-Goals

**Goals:**

- A draft stays editable. A published snapshot does not.
- Coverage is a declared list of categories, not "more records is better".

**Non-Goals:**

- Side-by-side diff of two snapshots. See `add-workbench-comparison`.
- Implementing this change in the spec pull request.

## Decisions

- Publish stores member record ids, a revision number, and a copy of title, status, and category at that time.
- Update or delete of the source record does not rewrite that copy.
- A caller who cannot read the snapshot receives 404 if it is someone else's, and 403 if they lack the snapshot permission entirely.
- With no coverage target, the UI shows member counts only and hides "missing categories".

## Risks / Trade-offs

- [Copies use storage] → They are the only way the historical screen stays stable.

## Migration Plan

Forward-only snapshot tables. No destructive SQL.

## Open Questions

None required before review.
