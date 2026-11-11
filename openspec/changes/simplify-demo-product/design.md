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

- Replace the migration directory with one initial migration for user, session, account, and verification. Delete the old SQL files. Do not add DROP. Anyone with the old schema creates a new database. This is the guess in Open Questions.
- Tables removed from the template: record_permission, record, workbench_settings, activity_event, job, observation, tag, record_tag, collection, membership, saved_view, record_section, record_artifact, snapshot, snapshot_member, snapshot_attempt, snapshot_target, note.
- Tables kept: user, session, account, verification.
- Routes removed from the app: `/records` and its children, `/notes`, `/wizard`, `/jobs`, `/collections`, `/snapshots`, `/activity`, `/settings`, `/analytics`.
- API routes removed: records, notes, jobs, activity, settings, analytics, collections, tags, saved views, evidence, artifacts, snapshots, comparisons, hierarchy.
- Record permission flags go away with records. Sign-in is the only gate.
- WIZ-2, WIZ-3, SHELL-1, THEME requirements, UI-1 through UI-5, AUTH-2, AUTH-5, HEALTH, and MIG-2 stay.

## Risks / Trade-offs

- [A fresh database surprises someone who already migrated] → The requirement says the old database is not upgraded. The open question asks the owner to confirm.
- [Coverage map will fail after files are deleted] → The implementation updates the map in the same change as the file deletion. This spec pull request does not.

## Migration Plan

Ship the new initial migration and delete the demo SQL files in the implementation pull request. Do not archive this change from the spec pull request. Rollback is to keep the current migration directory until that implementation.

## Open Questions

1. Is a fresh database acceptable, instead of an in-place migration?
2. Should `canView` and `canCurate` survive without records?
3. Should workbench settings remain as a name and email editor?
