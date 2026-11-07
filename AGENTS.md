# Agent guide

This repository is a public template for internal applications. Do not add real customer or business data.

## Specs

OpenSpec (`@fission-ai/openspec`, MIT) is the spec tool. The layout is the official `openspec/` tree. The project schema `agent-app` is a fork of official `spec-driven`. Do not add Spec Kit or BMAD.

Future work uses two pull requests:

1. Spec: add `openspec/changes/<name>/` with proposal, delta specs, design, and tasks. Do not archive. Do not edit `openspec/specs/`. A human reviews and merges.
2. Implementation: start from that merge commit. Write integration tests, implement, run checks, and open a pull request. Archive only after the code matches the approved specs. That archive updates the implemented baseline. It is not a release and not a deploy.

If acceptance criteria change, stop. The previous approval is invalid until a new spec pull request is merged.

The initial template pull request is the only bootstrap exception: spec and implementation landed together because the user asked for a working baseline. Do not copy that exception onto later changes. CI rejects the bootstrap sentence once `openspec/specs/` exists on the base branch.

## Reviews

Read `.github/review/README.md`. Do not approve your own pull request. Do not add a workflow that submits a review or marks one approved. Review prompts are for a person or a separate assistant a person starts. They are advisory.

## Code

- `packages/contracts` is Zod transport schemas only.
- `apps/web` calls `/api` on the same origin and does not import server code.
- `apps/api` keeps HTTP handlers thin. Note rules live in the note service.
- `pnpm check:architecture` enforces those boundaries.
- Migrations are forward-only and are not run by the API process.
- Do not weaken tests, CI, or review files to get a green run.

## Checks

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:e2e
```

`pnpm check` does not start Playwright. End-to-end needs PostgreSQL and Chromium.

Do not merge. Do not change repository settings.
