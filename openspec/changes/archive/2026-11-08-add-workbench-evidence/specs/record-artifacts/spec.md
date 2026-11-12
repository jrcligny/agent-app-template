# Spec Delta

## Purpose

Attaches logs, images, and files with metadata, owner checks, and immutable ids.

## ADDED Requirements

### Requirement: ART-1 Artifact access is safe
The API SHALL return an artifact only to its owner, with file name, media type, byte size, and created time. A text body SHALL NOT be executed as HTML. A stored link SHALL be a same-origin path or the request is a validation error. The response SHALL NOT include a session token or a secret field.

#### Scenario: Loading and success
- **WHEN** the owner opens their image and the bytes are available
- **THEN** a loading status may show first and then the image with its metadata

#### Scenario: Error
- **WHEN** the metadata exists but the bytes cannot be read
- **THEN** an error status is shown and no partial secret content is included

#### Scenario: Permission
- **WHEN** the session is not allowed to use artifacts
- **THEN** the screen shows a forbidden status

#### Scenario: Another account
- **WHEN** another account requests the artifact id
- **THEN** the response status is 404

#### Scenario: Unsafe link
- **WHEN** a client stores `javascript:` or an external absolute URL
- **THEN** the response is a validation error and nothing is stored

Trace: apps/api/src/features/evidence/artifacts.integration.test.ts :: "ART-1 hides another account's artifact and rejects an unsafe link"

### Requirement: ART-2 Artifact bytes are immutable
Replacing a file SHALL create a new id. The previous id SHALL keep returning the original bytes.

#### Scenario: Replace
- **WHEN** the owner uploads a new file for the same record
- **THEN** the new id is different and the old id still returns the old byte size

Trace: apps/api/src/features/evidence/artifacts.integration.test.ts :: "ART-2 keeps the original bytes after a replacement"
