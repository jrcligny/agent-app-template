# Design

## Context

See proposal.md. Migrations today refuse DROP and TRUNCATE. The demo schema has many tables beyond auth.

## Goals / Non-Goals

**Goals:**

- Backend is auth, account summary, and health.
- Demo routes and requirements are removed.
- No destructive SQL statement.

**Non-Goals:**

- An in-place upgrade of a database that already ran the demo migrations.
- Keeping the job scheduler "just in case".
- Editing `document-existing-components`.

## Decisions

- Replace the migration directory with one initial migration for user, session, account, and verification. Delete the old SQL files. Do not add DROP. A database that already applied the demo migrations is not upgraded in place. The owner confirmed a fresh database on pull request 4. That reply does not set `x-human-approval`.
- Tables removed from the template: record_permission, record, workbench_settings, activity_event, job, observation, tag, record_tag, collection, membership, saved_view, record_section, record_artifact, snapshot, snapshot_member, snapshot_attempt, snapshot_target, note.
- Tables kept: user, session, account, verification.
- Routes removed from the app: `/records` and its children, `/notes`, `/wizard`, `/jobs`, `/collections`, `/snapshots`, `/activity`, `/settings`, `/analytics`.
- API routes removed: records, notes, jobs, activity, settings, analytics, collections, tags, saved views, evidence, artifacts, snapshots, comparisons, hierarchy.
- `canView` and `canCurate` are removed with `record_permission`. Sign-in is the only gate. The owner confirmed this on pull request 4.
- WIZ-2, WIZ-3, SHELL-1, THEME requirements, UI-1 through UI-5, AUTH-2, AUTH-5, HEALTH, and MIG-2 stay.

## Risks / Trade-offs

- [A fresh database surprises someone who already migrated] → The owner accepted that. BACK-2 says the old database is not upgraded in place.
- [Coverage map will fail after files are deleted] → The implementation updates the map in the same change as the file deletion. This spec pull request does not.

## Migration Plan

Ship the new initial migration and delete the demo SQL files in the implementation pull request. Do not archive this change from the spec pull request. Rollback is to keep the current migration directory until that implementation.

## Resolved decisions

The owner answered these on pull request 4. The answers are decisions for this text. `x-human-approval` stays `pending`.

1. A fresh database is acceptable. There is no in-place migration from the demo schema.
2. `canView` and `canCurate` are removed. They are not stored.
3. Account settings stay limited to email and name. There is no settings editor.
