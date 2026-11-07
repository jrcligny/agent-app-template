# Testing

Tests follow behavior. There is no coverage percentage gate and no fixed test count. Authorization scenarios stay even if they add cases. A redundant test that only restates an implementation detail should not be added; say why if one is proposed.

| Check | What it proves |
| --- | --- |
| `env.test.ts` | Production origin, cookie, secret, and database password rules. Pure logic with many unsafe edges. |
| `migration-policy.test.ts` | Destructive SQL is rejected before a database is used. |
| Health integration | Real Hono requests. Liveness without a schema. Readiness before and after migrate. A second migrate keeps a row. |
| Notes integration | Real sign-up, HttpOnly cookie, untrusted origin, sign-out, owner list, cross-account 404, empty title. Disposable `slice_*` databases on localhost only. |
| Status component test | Shared loading, empty, error, and success names. |
| Playwright | Account journey, validation focus, saved note, narrow viewport, second account, and axe on those screens. |

Playwright saves screenshots when `ARTIFACTS_DIR` is set. Axe reports rule violations it can see. It does not certify the visual design. A human still reviews the UI.

Integration tests are the red/green loop for request behavior. The bootstrap pull request landed tests with the slice because that was the authorized exception. Later implementation pull requests can show a failing test before the fix.
