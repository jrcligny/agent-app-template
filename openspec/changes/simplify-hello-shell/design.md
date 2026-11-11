# Design

## Context

See proposal.md. The current header lists six business sections. `document-existing-components` still describes that header and is left untouched.

## Goals / Non-Goals

**Goals:**

- One signed-in sentence: Hello world.
- Theme menu and sign-in remain.
- Dashboard and settings requirements are marked removed.

**Non-Goals:**

- Deleting routes, tables, or Storybook stories. Those are the next changes.
- Changing Cyan-Teal values.
- Editing the pending coverage change.

## Decisions

- The signed-out view is the existing account form. Hello world is only for a session. This is a guess recorded in Open Questions.
- The product name stays Workbench until the owner renames it.
- SHELL-1 stays. The header still must not show API status, and health probes stay.
- No primary navigation list. Theme and account sit in the header.

## Risks / Trade-offs

- [HELLO-1 contradicts the pending NAV-1 header] → This change does not edit that file. The owner can leave it pending or withdraw it. It is not approved here.
- [Settings removal drops page size] → There is no table page size to store.

## Migration Plan

No schema change in this increment. Rollback is to keep the old routes until `simplify-demo-product` is implemented. No archive in the spec pull request.

## Open Questions

1. Must Hello world require a session, or is the sentence public and sign-in optional?
2. Should the product name stay Workbench?
3. Should any account setting remain besides email and name on the session?
