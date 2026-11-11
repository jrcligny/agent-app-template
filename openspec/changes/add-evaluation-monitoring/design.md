# Design

## Context

See proposal.md and the catalog component map. Campaigns, results, and promotion already have specs.

## Goals / Non-Goals

**Goals:**

- The home is the campaign list.
- Saved views and tags stay inside that product.
- Pass rate has a table, and a running campaign is not a zero.
- Activity sentences name launches, publishes, and promotions.

**Non-Goals:**

- A second analytics product for observations.
- Bulk delete.
- Notes.

## Decisions

- Home route is `/`. Filters live in the query: status, agent, tag, sort.
- A saved view stores only those fields plus nothing else, rebuilt onto `/`. This matches the current saved-view rule and is not an open redirect.
- Tags use the current character rule. Bulk tag is one transaction and 404s the whole batch when any id is foreign.
- Pass rate is passes divided by cases that have a result, for completed campaigns in the window. The window reuses inclusive start, exclusive end, UTC storage, and Europe/Paris labels. The chart uses the text color. The table is the accessible equivalent.
- Activity reuses the current list and adds three entry kinds. Scores stay on the case result, not in the log line.

## Risks / Trade-offs

- [Pass rate hides running work] → The home still shows running progress. The chart omits those rows on purpose so they are not zeros.
- [Observation analytics remains in the baseline] → This change does not remove it. Implementation should stop linking it from the header when HOME-1 lands.

## Migration Plan

No new table is required for the home or the chart if campaigns already store status and scores. Saved views can reuse the current view table with a campaign query. Do not drop observation tables here. Rollback restores the previous home link.

## Open Questions

See the catalog design, question 7. This increment assumes Settings stays and notes do not return.
