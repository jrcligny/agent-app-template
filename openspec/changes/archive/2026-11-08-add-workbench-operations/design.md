# Design

## Context

See proposal.md. Implement only after `add-reference-workbench` is archived into the implemented baseline.

## Goals / Non-Goals

**Goals:**

- Wizard, job, activity, and settings each have one integration or component test named in the spec.
- One Playwright test covers wizard completion and job retry. Do not add a test per button.

**Non-Goals:**

- A real queue service. The job can be a row the API updates.
- Email, SSO, or organization administration.

## Decisions

- The wizard collects title, status, and review on three steps. Closed status still requires a reason before Next.
- Cancel sets the job to cancelled and stops further progress updates.
- Activity is append-only for the caller's records. Another account's events are not listed.
- Settings store a display name and a page size of 10, 25, or 50.

## Risks / Trade-offs

- [Specified before the MVP exists] → Tasks stay unchecked. A human must accept this revision separately from the MVP if the scope changes.

## Migration Plan

Forward-only tables for jobs, events, and settings. No destructive SQL.

## Open Questions

None required to review the scenarios.
