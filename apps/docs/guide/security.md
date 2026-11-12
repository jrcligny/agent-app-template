# Security

Sessions use better-auth with the Drizzle adapter and email plus password. Cookies are HttpOnly and SameSite=Lax. Production requires HTTPS origins, secure cookies, a non-placeholder secret of at least 32 characters, and a database password that is not a local placeholder. Trusted origins cannot contain `*`.

State-changing `/api` requests that send an `Origin` not in that list are rejected. The account summary returns id, email, and name, and it does not return a password or a session token.

The web bundle must not contain `AUTH_SECRET` or `DATABASE_URL`. The architecture check fails if it does.

CI permissions are `contents: read` except the Pages job, which writes Pages only from `main`. The release example can request `id-token: write` only after a manual confirm and a repository variable, and it still does not deploy. Workflows that submit a pull request review, or that use the pull request target event, fail `pnpm check:deploy`.

No SSO and no mailer are configured. Do not expose this baseline on the public internet without the organization's identity provider.
