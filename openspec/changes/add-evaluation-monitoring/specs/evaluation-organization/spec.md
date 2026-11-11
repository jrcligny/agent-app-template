# Spec Delta

## Purpose

Lets the team tag agents and suites and reopen a campaign filter without storing an open redirect.

## ADDED Requirements

### Requirement: ORG-1 A saved view is only the campaign query
A saved view SHALL store only status, agent, tag, and sort. Opening it SHALL navigate to Campaigns with those fields rebuilt. It SHALL NOT redirect to another site.

#### Scenario: Reopen the view
- **WHEN** the person opens a view named Running campaigns
- **THEN** the address is the Campaigns list with status running

Trace: apps/api/src/features/evaluation/views.integration.test.ts :: "ORG-1 reopens a campaign view on Campaigns"

### Requirement: ORG-2 Tags are short names and bulk writes are atomic
A tag SHALL match a lowercase letter, digit, or hyphen, with length 1 to 40. Applying a tag to several agents SHALL be one transaction. If any id is missing or owned by someone else, the response SHALL be 404 and no tag in the batch SHALL change. A blank tag SHALL be a validation error.

#### Scenario: One foreign id blocks the batch
- **WHEN** the batch includes another account's agent id
- **THEN** the status is 404 and this account's tags are unchanged

Trace: apps/api/src/features/evaluation/tags.integration.test.ts :: "ORG-2 rolls back a tag batch that includes a foreign id"

### Requirement: ORG-3 The filter controls are reachable
The tag field SHALL show a validation error and move focus to itself when the tag is empty. Keyboard focus SHALL reach Save view. A narrow viewport SHALL wrap the actions and keep each button the width of its label.

#### Scenario: Empty tag
- **WHEN** the tag is blank and the user saves from the keyboard
- **THEN** focus stays on the tag field and nothing is stored

Trace: apps/web/src/features/evaluation/organize.test.tsx :: "ORG-3 keeps focus on an empty tag"
