# Proposal

## Why

The delivery chain still describes an in-process job scheduler and a demo that no longer exists. Images, Compose, Helm, CI, docs, and skills should stay, sized to the hello page and the auth API. This change specifies that adjustment. It does not edit workflows.

## What Changes

- API and web images stay non-root. CI still builds them and does not push.
- Compose still starts Postgres, one migrate step, the API, and the web app.
- The scheduler replica lock and the in-process scheduler go away. Helm may run more than one API replica. It still does not add an autoscaler.
- Checks, skill layout, English copy, spec coverage, and OpenSpec stay in CI.
- Docs still build from the site. Storybook stays an uploaded artifact and is not published.

## Capabilities

### New Capabilities

- `template-delivery`: images, Helm, checks, and docs for the simplified template.

### Modified Capabilities

- None. The pending `delivery-pipeline` text is not edited.

## Impact

- Depends on `simplify-demo-product` because the scheduler leaves with the jobs.
- `document-existing-components` stays pending. IMG-1, PIPE-1, and DOC-1 still match this change. HELM-1 does not: it exists only to protect the demo scheduler. DEL-2 replaces that rule when a person accepts this change. Accepting this change does not approve the pending change.

## User journey

A reviewer runs the same CI checks. The image job builds and does not push. Helm renders one API replica by default and also renders two replicas without a scheduler error. The docs site builds. Storybook is an artifact.

## UI acceptance

No new screen. Storybook presentation stays in `simplify-storybook`.

## Approval

`x-human-approval` is `pending`. This note is not a GitHub review.

## Breaking changes

Removing the scheduler replica guard is **BREAKING** for a chart that relied on that failure. This spec pull request does not archive.
