# async-job Specification

## Purpose
Shows progress for a caller's job and lets them cancel, see a failure, and retry.

## Requirements

### Requirement: JOB-1 Progress cancel failure and retry
The job screen SHALL show loading, progress, a cancelled state, an error state, and a retry action. Retry SHALL create a new attempt only for the caller's failed job.

#### Scenario: Cancel
- **WHEN** the user cancels a running job from the keyboard
- **THEN** the job becomes cancelled and no further success status is shown for that attempt

#### Scenario: Fail and retry
- **WHEN** a job fails and the user retries
- **THEN** an error status is shown first and a new attempt starts after retry

#### Scenario: Permission
- **WHEN** another account requests the job id
- **THEN** the response is 404

Trace: apps/api/src/features/jobs/jobs.integration.test.ts :: "JOB-1 cancels and retries only the caller's job"
