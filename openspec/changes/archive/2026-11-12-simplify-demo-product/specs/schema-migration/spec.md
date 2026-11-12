# Spec Delta

## REMOVED Requirements

### Requirement: MIG-1 Repeating migration keeps stored notes
**Reason**: The notes table is not part of the simplified schema.
**Migration**: BACK-2 checks that a user survives a second migration run. MIG-2 still refuses DROP and TRUNCATE.
