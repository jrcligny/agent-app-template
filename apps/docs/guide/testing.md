# Testing

Tests follow behavior. There is no coverage percentage gate and no fixed test count. Authorization scenarios stay even if they add cases. A redundant test that only restates an implementation detail should not be added; say why if one is proposed.

| Check | What it proves |
| --- | --- |
| `env.test.ts` | Production origin, cookie, secret, and database password rules. Pure logic with many unsafe edges. |
| `migration-policy.test.ts` | Destructive SQL is rejected before a database is used. |
| Health integration | Real Hono requests. Liveness without a schema. Readiness before and after migrate. A second migrate keeps a row. |
| Notes integration | Real sign-up, HttpOnly cookie, untrusted origin, sign-out, owner list, cross-account 404, empty title. Disposable `slice_*` databases on localhost only. |
| Records integration | Counts, forbidden list, filtered page, cross-account 404, closed-record validation, and atomic delete. Same disposable databases. |
| Operations integration | Job cancel stops later success, retry creates one new attempt, activity is newest-first and owner-scoped, and a saved page size is what the next record list uses. |
| Analytics integration | Fixture alpha totals, the Paris and UTC day buckets, a zero count versus a forbidden response, and a rejected window. |
| Scheduler unit | A failed tick does not stop the loop, and stop waits so a later tick does not run. |
| Workbench component tests | Dashboard counts, table selection, drawer focus, form validation, unsaved changes, and dismissed delete. |
| Status component test | Shared loading, empty, error, success, and forbidden names. |
| Evidence integration | Other-account artifact ids are not found, unsafe links store nothing, a deleted record hides the file, bytes stay immutable, and `canCurate: false` blocks the write. |
| Section tree | Keyboard expands a nested section. Text is text. Loading, empty, and error statuses are named. |
| Wizard progress | The progressbar value text matches the visible step sentence. Next follows Back and uses content width. |
| Playwright | Account journey, validation focus, saved note, narrow viewport, second account, the workbench create and confirmed delete journey, wizard progress on a wide and a 375px viewport, and axe on those screens. | |

Playwright saves screenshots when `ARTIFACTS_DIR` is set. Axe reports rule violations it can see. It does not certify the visual design. A human still reviews the UI.

Integration tests are the red/green loop for request behavior. The bootstrap pull request landed tests with the slice because that was the authorized exception. Later implementation pull requests can show a failing test before the fix.
