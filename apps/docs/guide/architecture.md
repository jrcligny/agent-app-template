# Architecture

The signed-in page says Hello world. A signed-out person sees the account form. The header shows the name Workbench, the theme menu, and the account. It does not list business sections and it does not show API status.

`packages/contracts` holds the health, error, and account schemas. The API is Hono. It serves better-auth, `GET /api/me`, and the health probes. The database tables are `user`, `session`, `account`, and `verification`. There is no record permission and no demo job loop.

The web app is Vite, React, and Tailwind CSS v4. Color lives in semantic tokens. The accent is `#06B6D4` in both themes. Light text is `#0F172A` on `#F0FDFA`. Dark text is `#F8FAFC` on `#0F172A`. Primary buttons use cyan with `#0F172A` text. Success is a neutral border, not green. Shared components that are not on the hello page are shown in Storybook with sample data.

Feature folders do not import each other. The browser calls `/api` on the same origin.
