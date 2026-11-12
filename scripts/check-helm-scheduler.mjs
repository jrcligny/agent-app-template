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
if (safe.stdout.includes("kind: HorizontalPodAutoscaler")) {
  console.error("default install rendered an autoscaler");
  process.exit(1);
}
if (!safe.stdout.includes("replicas: 1")) {
  console.error("default install did not set one API replica");
  process.exit(1);
}

const scaled = render(["--set", "api.replicaCount=2"]);
if (scaled.status !== 0) {
  console.error(scaled.stderr);
  process.exit(1);
}
if (!scaled.stdout.includes("replicas: 2")) {
  console.error("two API replicas did not render");
  process.exit(1);
}

const autoscaled = render(["--set", "autoscaling.enabled=true"]);
if (autoscaled.status !== 0) {
  console.error(autoscaled.stderr);
  process.exit(1);
}
if (!autoscaled.stdout.includes("kind: HorizontalPodAutoscaler")) {
  console.error("enabled autoscaling did not render a HorizontalPodAutoscaler");
  process.exit(1);
}

console.log("DEL-2 allows two API replicas and an autoscaler");
