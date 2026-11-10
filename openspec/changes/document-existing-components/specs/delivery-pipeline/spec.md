# delivery-pipeline

## Purpose

Records how images, the demo scheduler, checks, skills, and docs are built today.

## ADDED Requirements

### Requirement: IMG-1 Images run as non-root and CI does not push them
The API and web images SHALL run as non-root. Compose SHALL start Postgres, a one-shot migrate, the API, and the web proxy. The image job SHALL build both images with push set to false.

#### Scenario: CI builds without pushing
- **WHEN** the image job runs
- **THEN** both Dockerfiles build and neither image is pushed

Trace: .github/workflows/ci.yml

### Requirement: HELM-1 The demo scheduler refuses extra replicas
When the in-process scheduler is enabled, the chart SHALL refuse more than one API replica and SHALL use Recreate. It SHALL NOT render a HorizontalPodAutoscaler. Disabling the scheduler SHALL allow more than one replica.

#### Scenario: Enabled scheduler
- **WHEN** the scheduler is enabled and replicaCount is greater than 1
- **THEN** the chart template fails

Trace: scripts/check-helm-scheduler.mjs

### Requirement: PIPE-1 Checks and skills stay in one place
CI SHALL run architecture, skill layout, deploy policy, tests, OpenSpec, and the spec coverage check. Skills SHALL live only under `.agents/skills`.

#### Scenario: Duplicate skill paths fail
- **WHEN** a skill copy exists under `.cursor/skills` or `.github/skills`
- **THEN** the skill layout check fails

Trace: scripts/check-skill-layout.mjs

### Requirement: DOC-1 Docs build and Storybook stays an artifact
VitePress SHALL build the docs site. Storybook SHALL build in the same check. The static Storybook SHALL be uploaded as a CI artifact. Publishing it beside the docs site SHALL stay disabled until a person enables Pages.

#### Scenario: Pages workflow is not the Storybook publish
- **WHEN** the Pages workflow runs
- **THEN** it builds the VitePress site and does not deploy Storybook

Trace: .github/workflows/pages.yml
