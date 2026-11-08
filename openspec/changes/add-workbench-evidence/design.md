# Design

## Context

See proposal.md. Sections and artifacts hang off a record the caller owns.

## Goals / Non-Goals

**Goals:**

- Render a tree of named fields and nested lists.
- Store artifact metadata: id, file name, media type, byte size, and created time.
- Serve bytes only through a same-origin relative URL that checks the owner.

**Non-Goals:**

- A general document editor with scripting.
- Scanning malware. The spec only blocks active content and external or script links.
- Implementing this change in the spec pull request.

## Decisions

- Section types `input`, `context`, and `expected criteria` are optional labels, not a test model. A record may omit them.
- Text is escaped. The UI does not parse HTML.
- Stored link values must be same-origin paths. `javascript:` and absolute external URLs are rejected with a validation error.
- Artifact responses omit cookies, tokens, and secret fields.
- Replacing a file creates a new artifact id. The previous id still returns the previous bytes if the caller could read them.

## Risks / Trade-offs

- [Rich text is useful] → It is out of scope so the first viewer stays safe.

## Migration Plan

Forward-only tables. No destructive SQL.

## Open Questions

None required before review.
