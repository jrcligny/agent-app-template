import { healthResponseSchema } from "@agent-app/contracts";
import { useEffect, useState } from "react";

type HealthState = "loading" | "ok" | "unavailable";

export function HealthBadge() {
  const [state, setState] = useState<HealthState>("loading");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/health", { signal: controller.signal, credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          setState("unavailable");
          return;
        }
        const parsed = healthResponseSchema.safeParse(await response.json());
        setState(parsed.success ? "ok" : "unavailable");
      })
      .catch(() => {
        if (!controller.signal.aborted) setState("unavailable");
      });
    return () => controller.abort();
  }, []);

  const label =
    state === "loading" ? "Checking API" : state === "ok" ? "API ok" : "API unavailable";
  return (
    <p role="status" className={state === "ok" ? "text-ok" : "text-muted"}>
      {label}
    </p>
  );
}
