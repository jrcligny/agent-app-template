import { spawnSync } from "node:child_process";

const chart = "deploy/helm/agent-app";
const example = ["-f", "deploy/helm/agent-app/values-render-example.yaml"];

function render(args) {
  return spawnSync("helm", ["template", "demo", chart, ...example, ...args], { encoding: "utf8" });
}

const safe = render([]);
if (safe.status !== 0) {
  console.error(safe.stderr);
  process.exit(1);
}
if (!safe.stdout.includes("type: Recreate")) {
  console.error("enabled scheduler did not render Recreate");
  process.exit(1);
}
if (!safe.stdout.includes('value: "true"') || !safe.stdout.includes("JOB_SCHEDULER")) {
  console.error("enabled scheduler did not set JOB_SCHEDULER true");
  process.exit(1);
}
if (safe.stdout.includes("kind: HorizontalPodAutoscaler")) {
  console.error("chart rendered an HPA");
  process.exit(1);
}

const scaled = render(["--set", "api.replicaCount=2"]);
if (scaled.status === 0) {
  console.error("scheduler allowed api.replicaCount 2");
  process.exit(1);
}
if (!scaled.stderr.includes("replicaCount 1")) {
  console.error(scaled.stderr);
  process.exit(1);
}

const disabled = render(["--set", "api.scheduler.enabled=false", "--set", "api.replicaCount=2"]);
if (disabled.status !== 0) {
  console.error(disabled.stderr);
  process.exit(1);
}
if (!disabled.stdout.includes('name: JOB_SCHEDULER') || !disabled.stdout.includes('value: "false"')) {
  console.error("disabled scheduler did not set JOB_SCHEDULER false");
  process.exit(1);
}
if (!disabled.stdout.includes("replicas: 2")) {
  console.error("disabled scheduler did not allow two API replicas");
  process.exit(1);
}

console.log("helm scheduler guard ok");
