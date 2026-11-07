# Copilot instructions

Read AGENTS.md and .github/review/README.md before changing behavior.

- Spec pull requests add `openspec/changes/<name>/` and do not archive. Implementation pull requests start from the approved spec commit.
- Do not approve your own pull request. `Author approval: none` stays in the body. Do not write an approval status.
- Do not merge. Do not change repository settings, rulesets, or secrets.
- Do not weaken CI, authorization tests, or import boundaries to make a change smaller.
- Web code calls same-origin `/api` only. Do not import the API, database, or server auth package.
- Migrations are forward-only and run once per release, not in the API process.
- OpenSpec is the spec tool. Do not add Spec Kit or BMAD.
- Generated OpenSpec skills are regenerated with `pnpm exec openspec update`. Do not hand-edit them.
