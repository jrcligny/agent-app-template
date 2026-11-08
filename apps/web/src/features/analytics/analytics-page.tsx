import { analyticsReportSchema, type AnalyticsReport } from "@agent-app/contracts";
import { useState } from "react";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";
import { AnalyticsChart } from "./analytics-chart";

const demoFrom = "2026-01-15T00:00:00.000Z";
const demoTo = "2026-01-16T00:00:00.000Z";

export function AnalyticsPage() {
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "empty" | "error" | "forbidden">("idle");
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [from, setFrom] = useState(demoFrom);
  const [to, setTo] = useState(demoTo);
  const [timeZone, setTimeZone] = useState<"UTC" | "Europe/Paris">("Europe/Paris");

  async function load(nextFrom = from, nextTo = to, nextZone = timeZone) {
    setPhase("loading");
    setReport(null);
    try {
      const params = new URLSearchParams({ from: nextFrom, to: nextTo, timeZone: nextZone });
      const result = await apiFetch(`/api/analytics?${params.toString()}`, (value) => analyticsReportSchema.parse(value));
      setReport(result);
      setPhase(result.totals.count === 0 ? "empty" : "ready");
    } catch (error) {
      setReport(null);
      setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  async function loadFixture() {
    setPhase("loading");
    try {
      await apiFetch("/api/analytics/fixture", () => ({ fixture: "alpha", synthetic: true }), {
        method: "POST",
        body: JSON.stringify({ name: "alpha" }),
      });
      await load();
    } catch (error) {
      setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  return (
    <section className="grid gap-6" aria-labelledby="analytics-heading">
      <div className="grid gap-2">
        <h1 id="analytics-heading" className="text-2xl font-semibold">
          Analytics
        </h1>
        <p className="text-sm text-muted">
          Counts and series use stored observations only. Fixture alpha is labeled demo data, not a real measurement.
        </p>
      </div>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <label className="grid gap-1 text-sm">
          From
          <input className="rounded-md border border-line bg-surface px-3 py-2" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          To
          <input className="rounded-md border border-line bg-surface px-3 py-2" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm" htmlFor="analytics-zone">
          Time zone
          <select
            id="analytics-zone"
            className="rounded-md border border-line bg-surface px-3 py-2"
            value={timeZone}
            onChange={(event) => setTimeZone(event.target.value === "UTC" ? "UTC" : "Europe/Paris")}
          >
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        <ActionRow className="ml-auto" label="Analytics actions">
          <Button type="button" variant="quiet" onClick={() => void loadFixture()}>
            Load labeled fixture alpha
          </Button>
          <Button type="submit">Apply window</Button>
        </ActionRow>
      </form>
      {phase === "loading" ? <Status tone="loading" title="Loading analytics" /> : null}
      {phase === "forbidden" ? (
        <div className="grid gap-2">
          <p className="text-sm">Unknown</p>
          <Status tone="forbidden" title="You do not have permission to view records" />
        </div>
      ) : null}
      {phase === "error" ? (
        <div className="grid gap-3">
          <p className="text-sm">Unknown</p>
          <Status tone="error" title="Could not load analytics" detail="The totals are unknown." />
          <ActionRow>
            <Button onClick={() => void load()}>Retry</Button>
          </ActionRow>
        </div>
      ) : null}
      {report && (phase === "ready" || phase === "empty") ? (
        <div className="grid gap-4">
          <Status tone="success" title="Analytics loaded" detail={`${report.totals.count} observations, value sum ${report.totals.sum}.`} />
          <AnalyticsChart report={report} />
        </div>
      ) : null}
    </section>
  );
}
