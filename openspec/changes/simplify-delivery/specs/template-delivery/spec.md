# Spec Delta

## Purpose

Keeps the template deployable after the demo scheduler and the demo product are gone.

## ADDED Requirements

### Requirement: DEL-1 Images stay non-root and unpushed
The API and web images SHALL run as non-root. Compose SHALL start Postgres, a one-shot migrate, the API, and the web app. The image job SHALL build both images with push set to false.

#### Scenario: CI builds without pushing
- **WHEN** the image job runs
- **THEN** both images build and neither image is pushed

Trace: .github/workflows/ci.yml :: "DEL-1 builds both images without pushing"

### Requirement: DEL-2 Helm does not guard a scheduler
The chart SHALL NOT require a single API replica because of an in-process scheduler, and SHALL NOT render a HorizontalPodAutoscaler. The default replica count SHALL be 1. Setting replica count above 1 SHALL render.

#### Scenario: Two replicas
- **WHEN** replicaCount is 2
- **THEN** the chart renders and does not fail for a scheduler

Trace: scripts/check-helm-scheduler.mjs :: "DEL-2 allows two API replicas"

### Requirement: DEL-3 Checks stay in one place
CI SHALL run architecture, skill layout, deploy policy, English copy, tests, OpenSpec, and spec coverage. Skills SHALL live only under `.agents/skills`.

#### Scenario: Duplicate skill paths fail
- **WHEN** a skill copy exists under `.cursor/skills` or `.github/skills`
- **THEN** the skill layout check fails

Trace: scripts/check-skill-layout.mjs :: "DEL-3 rejects a skill outside .agents/skills"

### Requirement: DEL-4 Docs build and Storybook stays an artifact
VitePress SHALL build the docs site. Storybook SHALL build in the same check and SHALL be uploaded as a CI artifact. The Pages workflow SHALL NOT deploy Storybook.

#### Scenario: Pages is not the Storybook publish
- **WHEN** the Pages workflow runs
- **THEN** it builds the VitePress site and does not deploy Storybook

Trace: .github/workflows/pages.yml :: "DEL-4 does not deploy Storybook"
