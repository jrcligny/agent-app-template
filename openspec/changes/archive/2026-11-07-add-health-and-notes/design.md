# Design

## Context

See proposal.md for why this slice exists. The repository starts without a running app. Local development uses a disposable PostgreSQL database. Production cookies and origins are validated before the process serves traffic.

## Goals / Non-Goals

**Goals:**

- Same-origin `/api` so the browser does not hold a database URL or auth secret.
- Owner checks in the note service, with thin HTTP handlers.
- One migration Job per release, and no migration on API startup.
- Graceful shutdown on SIGTERM so a pod can finish the open request and close the pool.

**Non-Goals:**

- SSO, email delivery, and password reset.
- A second product surface beyond health, account access, and notes.
- Automatic rollback of database schema.

## Decisions

- Email and password sessions are the baseline because they need no third-party client secret. Production deployments should add the organization's identity provider before the app is reachable outside a private network.
- Cookies are HttpOnly, SameSite=Lax, and secure in production. Cross-subdomain cookies stay off.
- Another account's note returns 404 so the API does not reveal that the id exists.
- Drizzle SQL migrations are committed. The migrator refuses DROP TABLE, DROP COLUMN, and TRUNCATE. API pods only serve traffic.
- The Helm chart requires an existing Secret and runs migrate as a pre-install and pre-upgrade Job. `helm rollback` rolls back Deployments only. A schema change must stay compatible with the previous app or ship as an expand/contract pair in a later change.
- Web UI uses shared button, text field, card, and status components. Feature screens do not copy those controls.
- OpenSpec `agent-app` is a fork of the official `spec-driven` schema. Requirement text still uses the official delta sections.

## Risks / Trade-offs

- [Email and password without a mailer] → Document that reset and verification email are not configured. Do not pretend they are.
- [App rollback without schema rollback] → Keep migrations additive. Record a breaking schema change in a spec pull request before implementation.
- [Review prompts are advisory] → They do not create a GitHub reviewer identity. Humans merge.

## Migration Plan

1. Apply the forward migration once.
2. Start API and web.
3. To undo the app release, roll the Deployments back. Do not run a down migration; none is provided.

## Open Questions

None that change the spec. SSO is intentionally later.
