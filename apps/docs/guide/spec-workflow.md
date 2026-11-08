# Spec workflow

OpenSpec 1.16.1 from Fission-AI is installed as an exact dev dependency. It is MIT licensed. `openspec init` created the official `openspec/` tree. Workflow skills are generated only by `pnpm openspec:skills`, which runs `openspec init --tools agents`. The committed bodies are `.agents/skills/<name>/SKILL.md`. The project schema `agent-app` is `openspec schema fork spec-driven agent-app`. Requirement text still uses the official `ADDED`, `MODIFIED`, `REMOVED`, and `RENAMED` sections. A `DEPRECATED` heading is rejected by the parser.

Cursor's skill documentation lists `.agents/skills/` as a project directory it loads: [Agent Skills](https://cursor.com/docs/skills). GitHub Copilot's skill documentation lists the same directory for repository skills: [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills). Those two statements are from the vendor docs. This template has not executed Cursor or Copilot to prove a skill was invoked. Other agents are not claimed. `AGENTS.md` is shared instructions, not a second copy of the skills and not a discovery mechanism. `pnpm check:skills` fails if another `SKILL.md` is committed or if the generated `.cursor` or `.github` skill and command copies return.

## Statuses

| Status | Where it lives | What it means |
| --- | --- | --- |
| Proposed | `openspec/changes/<name>/` | Not the implemented baseline. Merging a spec pull request leaves it here. |
| Implemented baseline | `openspec/specs/` | Updated only when a delivered change is archived. Describes code on that branch. Not a release. |
| Released | a git tag a human creates | None exists. Nothing has been deployed. |

Docs pages under `apps/docs/generated` are built from those files. Edit the OpenSpec sources, not the generated pages.

## Two pull requests

1. Spec pull request: proposal, delta specs, design, tasks. Include a user journey. UI changes name loading, empty, error, success, validation, permission, keyboard, focus, and narrow layout as scenarios. Do not archive.
2. After a human merges, implementation starts at that commit. Integration tests trace to requirement ids. Archive only when the code matches.

`x-spec-revision` is a hash of the proposal and delta specs. `x-human-approval: pending` is the default. `approved` is only consistent when `x-approved-revision` matches and `x-approved-commit` is 40 hex characters. That record still does not prove a person approved it. `agent-approved` fails the check.

## Breaking changes

Mark **BREAKING** in the proposal. Put removals in `## REMOVED Requirements` with **Reason** and **Migration**. State compatibility, such as expand then contract, in the design. The migrator rejects `DROP TABLE`, `DROP COLUMN`, and `TRUNCATE`.

## Commands

```bash
pnpm exec openspec new change add-export --schema agent-app
pnpm exec openspec validate add-export --strict --no-interactive
node scripts/check-spec-workflow.mjs --write
pnpm exec openspec archive add-export --yes
```

Archive is for the implementation pull request, after the work exists. `openspec validate --all --strict` is the parser check. `pnpm check:specs` checks revision hashes, the user journey, and UI words. Neither command is a human approval.
