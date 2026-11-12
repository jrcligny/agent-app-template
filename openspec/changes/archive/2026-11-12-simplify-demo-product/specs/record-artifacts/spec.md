# Spec Delta

## REMOVED Requirements

### Requirement: ART-1 Artifact access is safe
**Reason**: File attachments are a demo feature.
**Migration**: Do not serve `/api/artifacts`. The evidence panel is removed.

### Requirement: ART-2 Artifact bytes are immutable
**Reason**: File attachments are a demo feature.
**Migration**: Do not store artifact bytes.
