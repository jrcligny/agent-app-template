# Architecture review

Check dependency direction, import boundaries, duplication, and abstraction that does not earn its keep. Routes stay thin. Shared UI is reused instead of copied per feature.

When Docker, Helm, probes, or process lifetime change, also check non-root users, resources, liveness versus readiness, one-shot migration, graceful shutdown, and rollback limits.

Do not request a new layer unless the current structure blocks a real change.
