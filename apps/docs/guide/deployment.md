# Deployment

Two images run as non-root. The API image uses the `node` user. The web image is `nginxinc/nginx-unprivileged` and listens on 8080. Compose runs Postgres, a one-shot migrate service, the API, and the web proxy.

The Helm chart `deploy/helm/agent-app` creates two Deployments and a migrate Job hooked to pre-install and pre-upgrade. Pods do not migrate. The chart refuses to render without `database.existingSecret`, a public https URL, trusted origins, and an ingress host. It does not create the Secret. Secure cookies are set to true. The API container handles SIGTERM by closing the server and then the pool. `terminationGracePeriodSeconds` is 30.

There is no in-process job scheduler. `api.replicaCount` defaults to 1 and may be raised. When `autoscaling.enabled` is true, the chart renders a HorizontalPodAutoscaler for the API. The default install leaves autoscaling off.

`helm rollback` restores Deployments. It does not reverse SQL. Ship compatible migrations, or split a breaking change into expand and contract changes with a spec.

## What is not deployed

- No image is pushed by the template workflows.
- `release-example.yml` runs only on manual dispatch, only if `ENABLE_EXAMPLE_RELEASE` is `true`, and it still builds with `push: false`. It exits if `EXAMPLE_CLOUD_ROLE` is empty. It does not contain a cloud login.
- Cloud OIDC is provider-specific and is not wired. A human would add their own workflow, for example AWS `sts:AssumeRoleWithWebIdentity`, Google Workload Identity, or Azure federated credentials, using a role they create. Do not invent account ids or claim those roles exist.
- Pull requests do not receive `id-token: write`.
- GitHub Pages workflow deploys only after a push to `main`, and only if a human has set Pages to GitHub Actions. As of bootstrap, Pages was disabled (`has_pages: false`).
- Storybook is built by `pnpm build` and uploaded as the `storybook` artifact on the CI checks job. It is not deployed. When Pages is enabled, a later change can upload `apps/web/storybook-static` beside the VitePress site, for example under `/agent-app-template/storybook/`, using the same Pages workflow. That publish step is intentionally not enabled here.

Action SHAs were taken from each repository's release tag and checked against that tag's commit. Re-check them when upgrading.
