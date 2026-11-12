# agent-app-template

Public template for internal applications. The sample is a signed-in Hello world page: health, sessions, and a theme control against PostgreSQL. It does not include business data.

The template repository and its docs are public. Applications built from it are expected to stay internal.

## Start

```bash
pnpm install --frozen-lockfile
docker compose up -d postgres
cp .env.example .env
pnpm db:migrate
pnpm dev
```

Then open `http://localhost:5173`.

```bash
pnpm check
pnpm test:e2e
```

Docs live in `apps/docs` and are built with base path `/agent-app-template/`. GitHub Pages is not enabled, so that site is not live.

## What is enforced

`pnpm check` runs architecture import rules, deploy policy, typecheck, lint, integration tests, OpenSpec's strict validator, spec revision checks, and the production build. Pull request text shape is checked in CI and does not approve the pull request.

## What a human still configures

- Ruleset so CODEOWNERS (`@jrcligny`) actually blocks a merge
- GitHub Pages source set to GitHub Actions
- Cloud OIDC and any image registry
- Review and merge

Authors do not approve or merge their own pull requests. Review guides are in `.github/review`. No review bot is installed.

OpenSpec is the spec tool. Later features are a spec pull request, then an implementation pull request. The first change is the bootstrap exception described in `CONTRIBUTING.md`.
