# Spec Delta

## REMOVED Requirements

### Requirement: DET-1 Drawer and full page
**Reason**: The record drawer is a demo screen. The drawer component stays as a story.
**Migration**: Use PAT-3 for the drawer story. Do not serve `/records/:id`.

### Requirement: DET-2 Another account's record stays hidden
**Reason**: There is no record id.
**Migration**: Another account's session is still a different user. No record payload is returned.
