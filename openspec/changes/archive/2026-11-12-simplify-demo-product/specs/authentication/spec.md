# Spec Delta

## REMOVED Requirements

### Requirement: AUTH-1 Notes require a session
**Reason**: The notes API is removed.
**Migration**: Hello world requires a session, specified by HELLO-2. Account reads use GET /api/me.

## MODIFIED Requirements

### Requirement: AUTH-3 Session cookie is HttpOnly and host-bound
The session cookie SHALL be HttpOnly, SHALL NOT use SameSite=None, and SHALL NOT be issued for an untrusted origin. A state-changing request that sends a session cookie SHALL include a trusted Origin.

#### Scenario: Sign-up cookie
- **WHEN** a client signs up from a trusted origin
- **THEN** the session cookie is HttpOnly
- **AND** the cookie does not use SameSite=None

#### Scenario: Untrusted origin
- **WHEN** a client attempts sign-up with an origin that is not trusted
- **THEN** the response is not successful

#### Scenario: Cookie without origin
- **WHEN** a signed-in client sends sign-out with a session cookie and no Origin
- **THEN** the response status is 403

Trace: apps/api/src/features/auth/auth.integration.test.ts :: "AUTH-3 sets an HttpOnly session cookie and rejects an untrusted or missing origin"

### Requirement: AUTH-4 Sign-out ends access
After sign-out, the API SHALL reject account requests that reuse the previous session cookie.

#### Scenario: Signed out
- **WHEN** a client signs out and then requests GET /api/me with the previous cookie
- **THEN** the response status is 401

Trace: apps/api/src/features/auth/auth.integration.test.ts :: "AUTH-4 rejects the account summary after sign-out"
