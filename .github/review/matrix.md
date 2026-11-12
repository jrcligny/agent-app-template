# Review matrix

Pick every lens whose question can be answered from the diff. One change often needs more than one.

| If the diff changes | Use |
| --- | --- |
| Sign-in, sessions, cookies, authorization, tenant or account isolation, secrets, queries, migrations, workflow permissions, action pins, dependency installs | Security |
| Module boundaries, dependency direction, duplication, new abstraction, Docker, Helm, probes, shutdown, resources | Architecture |
| `openspec/`, acceptance criteria, tests tied to requirement ids, removals, compatibility | Spec |
| Screens, shared components, keyboard, focus, loading, empty, error, success, contrast, narrow layout | UI |
| Images, chart, health probes, config, or rollback | Security and architecture, using the operations notes in those prompts |

## Spec pull request

Review requirements, risk, ambiguity, migration, and whether each scenario can be tested. Confirm `openspec/specs/` is unchanged and the change is not archived. `Baseline update: none` is a claim to check, not a waiver.

## Implementation pull request

Compare the code and tests with the approved spec commit. If the delta specs differ from that commit, the previous acceptance is invalid. Do not treat the author's summary as evidence.

## Operations notes

Use these inside the security and architecture lenses when deploy or health files change:

- containers run as non-root and are not privileged
- requests and limits are set
- liveness does not depend on the database; readiness does
- the API process does not migrate
- SIGTERM stops listening and closes the pool
- rollback of Deployments does not undo SQL
