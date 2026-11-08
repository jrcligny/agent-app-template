# Architecture

`packages/contracts` holds Zod schemas for JSON the browser and API share. It does not import Hono, Drizzle, or better-auth.

`apps/api` is a Hono process. `src/features/notes/notes.http.ts` parses requests and status codes. `notes.service.ts` applies owner checks and talks to PostgreSQL. Record routes do the same for synthetic workbench records: the HTTP file parses, and `records.service.ts` applies the owner check, the view and delete permission, and the all-or-nothing delete. Health routes stay next to their SQL check because there is no extra rule to extract. Auth session lookup is shared infrastructure, not a note feature.

`apps/web` is Vite, React, and Tailwind CSS v4. Screens use `Button`, `TextField`, `SelectField`, `Card`, and `Status`. The workbench adds `DataTable`, `Drawer`, and `ConfirmDialog` because more than one screen needs them. Feature folders do not import each other. Shared components do not import features. The browser calls `/api` on the same origin. Vite proxies that path in development. The web image and the Helm ingress do the same in deployment.

`pnpm check:architecture` fails the build when those imports are violated, including a cycle inside a package. It is a small script, not a general architecture product.

TypeScript is pinned to 6.0.3 because the ESLint parser in use does not accept TypeScript 7. The web tsconfig sets `ignoreDeprecations` so the `@/` path alias can keep working on TypeScript 6.

The API listens until SIGTERM or SIGINT, then closes the server and the pool. It does not migrate on startup. Readiness fails until the separate migrate command has created the note table.

Export jobs are rows in PostgreSQL. One loop in the API process advances a few locked rows at a time and resumes whatever is still queued or running after a restart. Cancel and retry take the same row lock, so a cancelled attempt cannot later be marked succeeded, and a failed attempt can be retried only once. This is a single-process demo scheduler. It is not a durable queue, and it is not safe to run as several API replicas. The simulated fail option is stored on that attempt so a failure can be reproduced without calling another service. Retry starts a new attempt that runs to completion. The failed row stays failed.
