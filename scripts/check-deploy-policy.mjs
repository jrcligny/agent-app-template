import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const findings = [];

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

for (const file of walk(root)) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (!relative.startsWith(".github/workflows/") && !relative.startsWith("deploy/") && !relative.endsWith("Dockerfile")) {
    continue;
  }
  const text = readFileSync(file, "utf8");
  if (/pull_request_target/.test(text)) findings.push(`${relative}: pull_request_target is not allowed`);
  if (/gh\s+pr\s+review|pulls\/.*\/reviews|review status:\s*approved/i.test(text)) {
    findings.push(`${relative}: workflows must not submit a pull request review`);
  }
  if (/privileged:\s*true/.test(text)) findings.push(`${relative}: privileged pods are not allowed`);
  if (/allowPrivilegeEscalation:\s*true/.test(text)) {
    findings.push(`${relative}: privilege escalation is not allowed`);
  }
  if (relative.startsWith(".github/workflows/") && /on:\s*\n\s*pull_request:/m.test(text) && /id-token:\s*write/.test(text)) {
    findings.push(`${relative}: pull requests must not receive a cloud identity token`);
  }
}

const apiDocker = readFileSync(path.join(root, "apps/api/Dockerfile"), "utf8");
if (!/^USER node/m.test(apiDocker)) findings.push("apps/api/Dockerfile: runtime must set USER node");
const webDocker = readFileSync(path.join(root, "apps/web/Dockerfile"), "utf8");
if (!webDocker.includes("nginxinc/nginx-unprivileged")) {
  findings.push("apps/web/Dockerfile: web image must use the unprivileged nginx image");
}
if (/^USER root/m.test(webDocker)) findings.push("apps/web/Dockerfile: must not switch back to root");

const chart = path.join(root, "deploy/helm/agent-app");
if (!statSync(chart).isDirectory()) findings.push("deploy/helm/agent-app is missing");

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("deploy policy ok");
