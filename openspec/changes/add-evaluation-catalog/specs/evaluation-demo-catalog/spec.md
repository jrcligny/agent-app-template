# Spec Delta

## Purpose

Fixes the English demo catalog so later campaign scores have stable agents, versions, and frozen cases.

## ADDED Requirements

### Requirement: DEMO-1 The catalog seed is English and local
The demo seed SHALL create Harbor support versions 1.2.0, 1.3.0, and 1.3.1, and Field notes version 0.9.0. It SHALL publish Support regression 3 and Field summary 1 with the cases below. It SHALL NOT call an external service. All names and case text SHALL be English.

#### Scenario: Support regression 3
- **WHEN** the catalog seed runs
- **THEN** Support regression 3 contains Delayed package, Refund over the limit, Address change, and Missing order id
- **AND** Delayed package and Refund over the limit use rule exact and threshold 1
- **AND** Address change uses rule numeric and threshold 0.8
- **AND** Missing order id uses rule numeric and threshold 0.5

#### Scenario: Field summary 1
- **WHEN** the catalog seed runs
- **THEN** Field summary 1 contains Short visit with rule exact and threshold 1, and Missing reading with rule numeric and threshold 0.7

Trace: apps/api/src/features/evaluation/demo.integration.test.ts :: "DEMO-1 seeds the English catalog without an external call"
