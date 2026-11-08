# Design

## Decision

Tokens live in one stylesheet. Light is the default. `data-theme` switches the same variable names. A head script sets the attribute from `workbench-theme` or `prefers-color-scheme` before paint. The select writes `system`, `light`, or `dark`.

Primary button text is `#0F172A` on `#06B6D4` (about 7.35:1). White on that cyan is about 2.43:1 and is not used. Cyan text on `#F0FDFA` is about 2.33:1, so light links and secondary buttons use `#0F172A` with a cyan underline or border. The light focus ring is `#0F172A` because cyan against the canvas is below 3:1. Dark cyan text on `#0F172A` is about 7.35:1 and on `#1E293B` about 6.03:1, so dark secondary text stays cyan. Borders use `#64748B` on the light canvas (about 4.56:1) and `#94A3B8` on the dark surfaces. Error text is `#7F1D1D` on `#FEE2E2` in light and `#FECACA` on `#1E293B` in dark. Success uses the text color as its border and does not use green.

## Not in this change

- No darker replacement for `#06B6D4`.
- No edit to archived proposal text or their revision hashes.
