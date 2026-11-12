# Spec Delta

## Purpose

Lists the signed-in person's record activity, newest first, without another account's events.

## ADDED Requirements

### Requirement: ACT-1 Activity list
The activity page SHALL page the caller's events, newest first, and SHALL show loading, empty, and error states.

#### Scenario: Empty
- **WHEN** the caller has no events
- **THEN** an empty status is shown

#### Scenario: Success
- **WHEN** the caller has events and the request succeeds
- **THEN** the newest event is first

#### Scenario: Cross-account
- **WHEN** another account's event exists
- **THEN** it is not in the caller's list

Trace: apps/api/src/features/activity/activity.integration.test.ts :: "ACT-1 lists only the caller's events newest first"
