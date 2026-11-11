# Design

## Context

See proposal.md and the hello-shell proposal. Sixteen stories exist today. Some are generic. Some exist only for the demo domain.

## Goals / Non-Goals

**Goals:**

- Storybook is the browser for remaining components.
- Name the stories that stay and the ones that go.

**Non-Goals:**

- Publishing Storybook on the docs site.
- Keeping a demo route so a component can be seen in the app.

## Decisions

Stay in the app: shell, theme menu, account form, and the button and text field those forms use.

Stay as stories only:

- Action row, select field, card, status, progress. Their pending UI-1 through UI-5 requirements still apply.
- Theme menu. THEME-1 through THEME-4 still apply.
- Data table, under PAT-1. The record search API is removed with TBL-1.
- Wizard frame, under PAT-2 and the existing WIZ-2 and WIZ-3 text. WIZ-1, which creates a record, is removed.
- Drawer, under PAT-3. DET-1 and DET-2 are removed.
- Confirm dialog, under PAT-3. CFM-1, which deletes records, is removed.

Remove, and do not keep as stories:

- Curation panel.
- Evidence panel and section tree.
- Coverage table.
- Diff table.
- Hierarchy path.
- Feature pages for records, notes, analytics, jobs, snapshots, activity, settings, and the record wizard.

The implementation deletes those files and drops their coverage-map rows. This pull request does not edit the map, so the current check still passes.

## Risks / Trade-offs

- [Stories and old requirements overlap until both increments archive] → PAT requirements are the target. Demo requirements are removed in the next change. Implement them in that order.
- [A generic table story is less realistic] → Sample rows are enough. The app does not grow a second product to host the table.

## Migration Plan

No database change. Rollback keeps the current stories. No archive in the spec pull request.

## Resolved decisions

The owner answered these on pull request 4. The answers are decisions for this text. `x-human-approval` stays `pending`.

1. The data table, wizard frame, drawer, and confirm dialog stay as stories with sample data. They are not deleted and they do not call a record API.
2. Storybook stays a CI artifact. The docs site does not publish it.
