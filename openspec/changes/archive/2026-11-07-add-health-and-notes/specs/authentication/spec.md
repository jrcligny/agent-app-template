# Spec Delta

## Purpose

Gives each person a session cookie for their own account and rejects note access when that session is missing or untrusted.

## ADDED Requirements

### Requirement: AUTH-1 Notes require a session
The API SHALL reject note requests that do not include a session.

#### Scenario: No cookie
- **WHEN** a client requests GET /api/notes without a session cookie
- **THEN** the response status is 401

Trace: apps/api/src/features/notes/notes.integration.test.ts :: "AUTH-1 rejects notes without a session"

### Requirement: AUTH-2 Account summary omits secrets
The account summary SHALL include only id, email, and name.

#### Scenario: Signed-in summary
- **WHEN** a signed-in client requests GET /api/me
- **THEN** the body has id, email, and name
- **AND** the body does not contain a password or session token

Trace: apps/api/src/features/notes/notes.integration.test.ts :: "AUTH-2 returns the account summary without a password or token"

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
- **WHEN** a signed-in client sends a state-changing note request with a session cookie and no Origin
- **THEN** the response status is 403

Trace: apps/api/src/features/notes/notes.integration.test.ts :: "AUTH-3 sets an HttpOnly session cookie and rejects an untrusted or missing origin"

### Requirement: AUTH-4 Sign-out ends access
After sign-out, the API SHALL reject note requests that reuse the previous session cookie.

#### Scenario: Signed out
- **WHEN** a client signs out and then requests GET /api/notes with the previous cookie
- **THEN** the response status is 401

Trace: apps/api/src/features/notes/notes.integration.test.ts :: "AUTH-4 rejects notes after sign-out"

### Requirement: AUTH-5 Production configuration rejects insecure defaults
In production the process SHALL refuse a public URL that is not https, a wildcard or loopback origin, a disabled secure cookie, a placeholder auth secret, or a local placeholder database password.

#### Scenario: Insecure production settings
- **WHEN** production configuration uses any of those insecure values
- **THEN** configuration fails and the process does not serve traffic

#### Scenario: Local development
- **WHEN** the environment is development and the origin is local http
- **THEN** configuration is accepted

Trace: apps/api/src/env.test.ts :: "AUTH-5 accepts a https production configuration"
Trace: apps/api/src/env.test.ts :: "AUTH-5 rejects an http public URL in production"
Trace: apps/api/src/env.test.ts :: "AUTH-5 rejects a wildcard origin"
Trace: apps/api/src/env.test.ts :: "AUTH-5 allows local http origins outside production"
