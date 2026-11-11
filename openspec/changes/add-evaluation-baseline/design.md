# Design

## Context

See proposal.md. Campaigns already have Pass, Fail, and Not run.

## Goals / Non-Goals

**Goals:**

- One baseline pin per agent.
- A word for every compared case.
- A confirmed promotion that does not deploy.

**Non-Goals:**

- Starting CI, publishing a model, or editing a promoted campaign's scores.
- A quality score computed from how many cases exist.

## Decisions

- The pin is a nullable campaign id on the agent. Promoting replaces it. The previous campaign stays in history with status promoted until the newer one replaces the pin. Both can remain readable.
- Comparison reads frozen results only. Regressed means the score fell or Pass became Fail. Improved means the score rose or Fail became Pass. Unchanged means both match. Added and removed cover case ids present on only one side.
- Not run is excluded from regression. A running campaign is not promotable because it is not complete.
- The confirm dialog reuses the existing confirm pattern. Escape closes it and returns focus to Promote.
- canCurate false blocks the write. canView false is 403. No new flag.

## Risks / Trade-offs

- [A pass with a lower score is still a regression] → That is the guess in open question 5. The spec blocks promotion on any regression.
- [Replacing the pin hides the previous baseline] → The previous campaign row remains and can be opened. Only the pin moves.

## Migration Plan

Add a nullable baseline campaign id on the agent and a promoted status on the campaign. Do not drop columns. Rollback ignores the pin and leaves campaigns unpromoted.

## Open Questions

See the catalog design, questions 4, 5, and 6. This increment ships the strict reading: any regression blocks promotion, and equality with the threshold is a pass.
