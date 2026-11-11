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
- Autoscaling is allowed. When it is enabled, the chart renders a HorizontalPodAutoscaler and does not fail. The default install still uses one replica and does not turn autoscaling on. The owner confirmed this on pull request 4. That reply does not set `x-human-approval`. The implementation must change the deploy check that currently rejects any HorizontalPodAutoscaler.
- CI keeps English, spec coverage, OpenSpec, and the non-root image build.
- Docs describe the hello page, auth, health, and Storybook. They stop describing records and the scheduler guard.

## Risks / Trade-offs

- [HELM-1 and DEL-2 disagree while both texts exist] → HELM-1 stays in the pending change. Do not archive that change as the product rule. DEL-2 is the target.
- [Two replicas without a queue are still just stateless API copies] → That is acceptable once no job loop writes rows.

## Migration Plan

Change the chart and the docs in the implementation pull request after the scheduler code is gone. No database change in this increment. No archive in the spec pull request.

## Resolved decisions

The owner answered these on pull request 4. The answers are decisions for this text. `x-human-approval` stays `pending`.

1. The chart no longer forbids autoscaling. Enabling it renders a HorizontalPodAutoscaler.
2. The docs site mentions Storybook only as a CI artifact. Pages does not publish it.
