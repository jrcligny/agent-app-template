# Spec Delta

## REMOVED Requirements

### Requirement: TBL-1 Search filter sort and pagination
**Reason**: The record table API is a demo feature. The table component stays as a story.
**Migration**: Use PAT-1 for sample rows. Do not serve `/api/records`.

### Requirement: TBL-2 Selection and bulk delete
**Reason**: Bulk delete of records is a demo feature.
**Migration**: The confirm story uses PAT-3 and does not delete records.
