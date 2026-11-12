# Spec review

For a spec pull request, inspect the journey, requirement ids, scenarios, ambiguity, migration, and whether a tester could fail the scenario. Removals need Reason and Migration. Breaking changes are marked **BREAKING**.

For an implementation pull request, compare behavior and tests with the approved spec commit. A trace must name a test that actually exercises the scenario. Missing coverage of an authorization scenario is blocking. Extra tests that only mirror implementation details are not required.

Do not treat `x-human-approval` as proof of a human.
