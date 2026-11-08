# Design

## Context

See proposal.md. Curation edits membership. It does not publish an immutable snapshot.

## Goals / Non-Goals

**Goals:**

- URL query is the shareable filter: `q`, `status`, `tag`, `collection`, `sort`, `page`.
- A saved view stores that query and a name. Opening it navigates to the same query.
- Bulk include, exclude, and annotate are one transaction.

**Non-Goals:**

- Immutable published sets. See `add-workbench-snapshots`.
- Charts. See `add-workbench-analytics`.
- Implementing this change in the spec pull request.

## Decisions

- A record may be in many collections. A collection has one owner.
- Annotate requires a non-empty rationale stored with the membership change.
- If any id is missing or not owned, the API returns 404 and writes nothing.
- A session without curation permission receives 403 and the screen shows forbidden, not an empty collection.

## Risks / Trade-offs

- [Partial success is easier to code] → The spec forbids it so callers do not lose track of which ids changed.

## Migration Plan

Forward-only tables for tags, views, collections, and membership. No destructive SQL.

## Open Questions

None required before review.
