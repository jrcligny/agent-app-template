# Design

## Context

See proposal.md. HELM-1 in the pending coverage change fails the chart when the scheduler is enabled and replicas are above one. Jobs are removed, so that guard has nothing to protect.

## Goals / Non-Goals

**Goals:**

- Keep images, Compose, Helm, CI, docs, and skills.
- Drop the scheduler-only replica rule.

**Non-Goals:**

- Adding a production queue.
- Enabling GitHub Pages for Storybook.
- Editing the pending coverage change.

## Decisions

- Delete the scheduler process and `JOB_SCHEDULER` when the demo product is removed. Helm no longer reads that flag.
- Default replicas stay 1 so the sample install is small. Two replicas must render.
- No HorizontalPodAutoscaler is added. That is a small chart, not a ban copied from the scheduler.
- CI keeps English, spec coverage, OpenSpec, and the non-root image build.
- Docs describe the hello page, auth, health, and Storybook. They stop describing records and the scheduler guard.

## Risks / Trade-offs

- [HELM-1 and DEL-2 disagree while both texts exist] → HELM-1 stays in the pending change. Do not archive that change as the product rule. DEL-2 is the target.
- [Two replicas without a queue are still just stateless API copies] → That is acceptable once no job loop writes rows.

## Migration Plan

Change the chart and the docs in the implementation pull request after the scheduler code is gone. No database change in this increment. No archive in the spec pull request.

## Open Questions

1. Should the chart keep forbidding an autoscaler, or is that silence enough?
2. Should the docs site mention Storybook only as a CI artifact?
