# Proposal

## Why

The MVP dashboard has two defined record counts. People still need charts that are computed only from declared observations, with a table they can read and a drill-through that keeps the same filters. This increment is not approved by being specified.

## What Changes

- Add observation facts with timestamps stored in UTC.
- Add counters and series whose formulas and fixture results are written in the spec.
- Distinguish zero, unknown, and no observations.
- Add a time-series chart and category or status bars, each with a textual table.
- Clicking a counter or a series point opens the record table with the same filters in the URL.
- No removals. Nothing here is **BREAKING**.

## Capabilities

### New Capabilities

- `observation-facts`: the synthetic rows charts are allowed to use.
- `analytics-charts`: counters, series, accessible equivalents, and drill-through.

### Modified Capabilities

- None. The MVP dashboard counts stay in `add-reference-workbench`.

## Impact

- Depends on the record table URL filters from `add-reference-workbench`.
- One integration test locks the fixture arithmetic. One component test locks keyboard drill and the data table. No extra end-to-end test.

## User journey

A person chooses a time window and sees a count, a daily series, and bars by status. They read the same numbers in a table. They activate a bar from the keyboard and land on the filtered table. A failed request shows unknown, not a zero line. A window with no observations shows an empty state, not invented points.

## UI acceptance

Loading, empty, error, and success are visible. Permission failure is forbidden, not zero. The chart is not color-only. Focus can reach each point or bar. A narrow viewport keeps the data table available.

## Approval

`x-human-approval` is `pending` for this change only. Merging the pull request does not approve it. The spec check does not treat `pending` as failure and does not prove a human decision.

## Breaking changes

None.
