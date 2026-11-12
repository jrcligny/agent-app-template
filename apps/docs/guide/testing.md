# Testing

Tests follow behavior. There is no coverage percentage gate.

| Check | What it proves |
| --- | --- |
| `env.test.ts` | Production origin, cookie, secret, and database password rules. |
| `migration-policy.test.ts` | Destructive SQL is rejected before a database is used. |
| Health integration | Liveness without a session. Readiness before and after migrate. A second migrate keeps a user. |
| Auth integration | Account summary omits secrets, the cookie is HttpOnly, a missing origin is forbidden, and sign-out ends access. |
| Hello component test | The page says Hello world and an empty password keeps focus. |
| Theme | A stored choice overrides the system default. |
| Playwright | Sign-in, Hello world, theme, a 375px viewport, and axe. |

Playwright saves screenshots when `ARTIFACTS_DIR` is set. Axe does not certify the visual design.
