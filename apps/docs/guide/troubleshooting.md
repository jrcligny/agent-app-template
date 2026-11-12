# Troubleshooting

## Tests refuse the database

The host must be `localhost` or `127.0.0.1`. The database name must start with `slice_`. Point `DATABASE_URL` at the maintenance database `app` on that host. The role needs permission to create databases.

## Sign-up returns 403

The browser origin must be listed in `TRUSTED_ORIGINS`, and `BETTER_AUTH_URL` must be that same origin. Vite uses `http://localhost:5173`. Preview and Playwright use `http://127.0.0.1:4173`. Compose uses `http://localhost:8080`.

## Readiness is 503

Run `pnpm db:migrate` once. The API will not create tables by itself.

## OpenSpec validate fails

Run `pnpm exec openspec validate --all --strict --no-interactive`. Requirement descriptions over 500 characters, a short Purpose, or a scenario without WHEN and THEN fail strict mode. Extra delta headings are rejected.

## Pages 404

The docs base path is `/agent-app-template/`. The site is not published until Pages is enabled by a human. A local `pnpm --filter @agent-app/docs dev` does not mean the public site exists.

## Helm template fails immediately

That is intentional when `database.existingSecret` or the public URL is empty. Render with `values-render-example.yaml` to see the shape. Do not put a real password in values.
