# Proposal

## Why

A record sometimes carries nested sections and files. Readers need a structured view, not a raw JSON blob, and downloads must not become a path for HTML, secrets, or arbitrary links. This increment is not approved by being specified.

## What Changes

- Add optional document sections: input, context, expected criteria, and other titled sections.
- Show them in an expandable tree or nested table.
- Attach logs, images, and files with metadata.
- Keep artifact bytes immutable and address them by id.
- No removals. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `record-sections`: readable nested content.
- `record-artifacts`: files with safe access and immutable ids.

### Modified Capabilities

- None.

## Impact

- Depends on record detail from `add-reference-workbench`.
- One integration test for access and link rejection. One component test for the tree and loading or error states.

## User journey

A person opens a record and expands a section. They see labeled fields, not only a JSON string. They open an image or a log that belongs to them. A missing file shows an error. Another account receives the same not-found response as a missing record. HTML in a text field is shown as text.

## UI acceptance

Loading, empty, error, and success are visible. Validation rejects an unsafe link. Permission failure is forbidden when the session cannot use artifacts at all, and not-found when the artifact belongs to someone else. Keyboard and focus can expand a node. A narrow viewport keeps the section titles readable.

## Approval

`x-human-approval` is `pending` for this change only. Merging the pull request does not approve it. The spec check does not treat `pending` as failure and does not prove a human decision.

## Breaking changes

None.
