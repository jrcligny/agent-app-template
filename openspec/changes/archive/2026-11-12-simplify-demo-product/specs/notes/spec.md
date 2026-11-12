# Spec Delta

## REMOVED Requirements

### Requirement: NOTES-1 Owner can create and list notes
**Reason**: Notes are a demo feature, not part of the minimal template.
**Migration**: Do not offer a notes route or table. Account data stays in the auth tables.

### Requirement: NOTES-2 Another account cannot read or change a note
**Reason**: The notes API is removed.
**Migration**: Owner isolation for auth stays on the session. There is no note id to hide.

### Requirement: NOTES-3 Invalid note input is rejected
**Reason**: The notes API is removed.
**Migration**: Account form validation is specified by HELLO-2.

### Requirement: NOTES-4 The notes screen shows loading, empty, error, and success
**Reason**: The notes screen is removed.
**Migration**: Those states remain on the hello page and the account form.

### Requirement: NOTES-5 Validation and permission failures stay visible to keyboard users
**Reason**: The notes screen is removed.
**Migration**: HELLO-2 covers keyboard validation on the account form.

### Requirement: NOTES-6 Narrow layout keeps the note form available
**Reason**: The notes screen is removed.
**Migration**: HELLO-3 covers the narrow header.
