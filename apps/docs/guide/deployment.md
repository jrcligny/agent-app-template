# Deployment

Two images run as non-root. The API image uses the `node` user. The web image is `nginxinc/nginx-unprivileged` and listens on 8080. Compose runs Postgres, a one-shot migrate service, the API, and the web proxy.

The Helm chart `deploy/helm/agent-app` creates two Deployments and a migrate Job hooked to pre-install and pre-upgrade. Pods do not migrate. The chart refuses to render without `database.existingSecret`, a public https URL, trusted origins, and an ingress host. It does not create the Secret. Secure cookies are set to true. The API container handles SIGTERM by stopping the job timer, closing the server, and then closing the pool. `terminationGracePeriodSeconds` is 30.

`api.scheduler.enabled` defaults to true. That loop is a single-process demo. The chart then requires `api.replicaCount: 1` and uses `Recreate`, so a rollout does not run two schedulers at once. A row lock stops two ticks in one process from advancing the same job. It does not make several pods a safe queue. The chart ships no HorizontalPodAutoscaler. Set `api.scheduler.enabled` to false before raising the replica count. The pods still serve HTTP, and jobs stay at the status already saved in PostgreSQL until one process with the scheduler enabled runs. A production queue would be a separate spec.

`helm rollback` restores Deployments. It does not reverse SQL. Ship compatible migrations, or split a breaking change into expand and contract changes with a spec.

## What is not deployed

- No image is pushed by the template workflows.
- `release-example.yml` runs only on manual dispatch, only if `ENABLE_EXAMPLE_RELEASE` is `true`, and it still builds with `push: false`. It exits if `EXAMPLE_CLOUD_ROLE` is empty. It does not contain a cloud login.
- Cloud OIDC is provider-specific and is not wired. A human would add their own workflow, for example AWS `sts:AssumeRoleWithWebIdentity`, Google Workload Identity, or Azure federated credentials, using a role they create. Do not invent account ids or claim those roles exist.
- Pull requests do not receive `id-token: write`.
- GitHub Pages workflow deploys only after a push to `main`, and only if a human has set Pages to GitHub Actions. As of bootstrap, Pages was disabled (`has_pages: false`).

Action SHAs were taken from each repository's release tag and checked against that tag's commit. Re-check them when upgrading.
