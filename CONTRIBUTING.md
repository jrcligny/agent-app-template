# Contributing

## Future features

1. Open a spec pull request. Use `.github/PULL_REQUEST_TEMPLATE/spec.md`.
2. A human reviews the journey, requirements, risk, ambiguity, migration, and testability, then merges.
3. From that commit, open an implementation pull request. Use `.github/PULL_REQUEST_TEMPLATE/implementation.md`.
4. Tests and code follow the approved spec. Archive with `pnpm exec openspec archive <name> --yes` only when the implementation is delivered.
5. A human reviews with `.github/review/matrix.md` and merges. Authors do not approve or merge their own pull request.

Changing acceptance criteria requires a new spec pull request. The implementation pull request names the approved commit. CI checks that the body has that shape. It does not decide that a human approved it.

## Bootstrap

The first pull request includes both the spec and the working slice. That was explicitly requested so the template has a baseline. It is not the process for the next feature.

## Local checks

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:e2e
```

PostgreSQL must be reachable at `DATABASE_URL` or at `postgres://app:local-dev-only@127.0.0.1:5432/app`. Tests create and drop `slice_*` databases. They refuse any other host.

## Reviews and settings

CODEOWNERS requests `@jrcligny`. A ruleset that requires code-owner review is not configured by this repository. Branch protection was not changed. Pages is not enabled. No review provider is connected.

Policy files are listed in `.github/review/findings.md`. Editing them to skip checks is a blocking review finding once a human is reviewing. Until a ruleset exists, CI is the automated gate and a person is still the merge gate.
