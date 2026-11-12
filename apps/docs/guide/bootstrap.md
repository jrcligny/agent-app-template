# Bootstrap

Requirements: Node.js 22.22 or newer, pnpm 10.33, and PostgreSQL 16.

```bash
pnpm install --frozen-lockfile
docker compose up -d postgres
cp .env.example .env
pnpm db:migrate
pnpm dev
```

The web app is at `http://localhost:5173` and proxies `/api` to `http://127.0.0.1:3000`. Compose can also build the two images and serve both on `http://localhost:8080`. The local database password is `local-dev-only` and is rejected if `NODE_ENV=production`.

```bash
pnpm check
pnpm test:e2e
```

`pnpm check` is typecheck, lint, architecture and deploy policy, unit and integration tests, OpenSpec validation, spec revision checks, and the docs and Storybook build. End-to-end is separate because it needs Chromium.

The first pull request is a bootstrap exception: the spec and the working slice are introduced together. Later features use the two-pull-request flow in [Spec workflow](./spec-workflow).
