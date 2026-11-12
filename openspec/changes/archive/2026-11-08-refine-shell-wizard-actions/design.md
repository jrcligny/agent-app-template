# Design

## Decision

The header slot that rendered the health badge is removed. Operational probes stay on `/api/health` and `/api/health/ready`.

Wizard progress is a labeled bar. The visible sentence and `aria-valuetext` are the same: `Step {current} of {total}. Current step: {title}.` `aria-valuenow` is the step, not a percentage. The fill is a second cue.

`Button` uses `w-fit` and a 44px minimum height so a CSS grid parent does not stretch it. `ActionRow` is `flex flex-wrap justify-end gap-3`. Text fields keep `w-full`. Full-width buttons are not the default on a wide layout. A narrow row may wrap.

## Not in this change

- No new permission.
- No change to archived proposal text or their `x-spec-revision` values.
- No paid component library.
