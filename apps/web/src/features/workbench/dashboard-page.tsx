import { recordCountsSchema, type RecordCounts } from "@agent-app/contracts";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Status } from "@/components/feedback/status";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";

type Phase = "loading" | "ready" | "error" | "forbidden";

export function DashboardPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [counts, setCounts] = useState<RecordCounts | null>(null);

  async function load() {
    setPhase("loading");
    setCounts(null);
    try {
      const result = await apiFetch("/api/records/counts", (value) => recordCountsSchema.parse(value));
      setCounts(result);
      setPhase("ready");
    } catch (error) {
      setCounts(null);
      setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="grid gap-6" aria-labelledby="dashboard-heading">
      <div className="grid gap-2">
        <h1 id="dashboard-heading" className="text-2xl font-semibold">
          Dashboard
        </h1>
        <p className="text-sm text-muted">Counts use only the records you can read. A failed request stays unknown.</p>
      </div>
      {phase === "loading" ? <Status tone="loading" title="Loading dashboard" /> : null}
      {phase === "forbidden" ? (
        <Status tone="forbidden" title="You do not have permission to view records" />
      ) : null}
      {phase === "error" ? (
        <div className="grid gap-3">
          <Status tone="error" title="Could not load the dashboard" detail="The counts are unknown." />
          <Button onClick={() => void load()}>Retry</Button>
        </div>
      ) : null}
      {phase === "ready" && counts ? (
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <CountLink
              href="/records"
              label="All records you can read"
              value={counts.all}
            />
            <CountLink
              href="/records?status=open"
              label="Open records among the records you can read"
              value={counts.open}
            />
          </div>
          {counts.open === 0 ? (
            <Status tone="empty" title="No open records" detail="Zero means no open records." />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function CountLink({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link to={href} className="rounded-lg border border-line bg-surface p-4">
      <span className="block text-sm text-muted">{label}</span>
      <span className="mt-2 block text-3xl font-semibold">{value}</span>
    </Link>
  );
}
