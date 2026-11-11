# Proposal

## Why

After campaigns exist, the home, the filters, and the pass-rate view still speak the language of generic records. This change specifies the monitoring layer: the campaign home, saved views, tags, a chart with a table, and activity wording. It does not implement them.

## What Changes

- Campaigns is the home and lists runs, not open records.
- A saved view stores only status, agent, tag, and sort, and always opens Campaigns.
- Tags apply to agents and suites. A bulk tag is one transaction.
- Pass rate is a chart plus a table. A running campaign is omitted, not drawn as zero. An empty window has count zero.
- Activity entries name launches, suite publishes, and promotions.

## Capabilities

### New Capabilities

- `evaluation-home`: the campaign list as the signed-in home.
- `evaluation-organization`: tags and saved views for the evaluation product.
- `evaluation-pass-rate`: the chart, the table, and the time window.
- `evaluation-activity`: activity wording for evaluation actions.

### Modified Capabilities

- None.

## Impact

- Depends on `add-evaluation-baseline` so the home can show a promotion state.
- Reuses the data table, saved views, tags, charts, and the activity list.
- Notes stay out of the product. Their archived requirements are not removed in this spec pull request.

## User journey

The engineer lands on Campaigns and filters to running. They save that filter as Running campaigns and open it later from the same screen. They tag Harbor support with `support`. The pass-rate chart and its table show completed campaigns only. Activity lists the publish, the launch, and the promotion in English sentences.

## UI acceptance

Loading, empty, error, success, validation, and permission stay named. Keyboard focus can reach the filter and the save control. A narrow viewport keeps the table. The chart series is not green and is not the only statement of the number.

## Approval

`x-human-approval` is `pending`. This note is not a GitHub review.

## Breaking changes

None in this spec pull request. The home replaces the generic dashboard only when this increment is implemented.
