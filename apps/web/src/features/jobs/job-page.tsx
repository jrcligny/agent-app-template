import { jobListSchema, jobSchema, type Job } from "@agent-app/contracts";
import { useEffect, useState } from "react";
import { ProgressMeter } from "@/components/feedback/progress";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { ApiError, apiFetch } from "@/lib/api";

export function JobPage() {
  const [phase, setPhase] = useState<"loading" | "ready" | "error" | "forbidden">("loading");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [outcome, setOutcome] = useState<"complete" | "fail">("fail");
  const current = jobs[0] ?? null;

  async function load() {
    try {
      const result = await apiFetch("/api/jobs", (value) => jobListSchema.parse(value));
      setJobs(result.jobs);
      setPhase("ready");
    } catch (error) {
      setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!current || (current.status !== "queued" && current.status !== "running")) return;
    const timer = setInterval(() => {
      void load();
    }, 400);
    return () => clearInterval(timer);
  }, [current?.id, current?.status]);

  async function start() {
    setPhase("loading");
    try {
      await apiFetch("/api/jobs", (value) => jobSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({ outcome }),
      });
      await load();
    } catch (error) {
      setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  async function cancel() {
    if (!current) return;
    await apiFetch(`/api/jobs/${current.id}/cancel`, (value) => jobSchema.parse(value), { method: "POST" });
    await load();
  }

  async function retry() {
    if (!current) return;
    await apiFetch(`/api/jobs/${current.id}/retry`, (value) => jobSchema.parse(value), { method: "POST" });
    await load();
  }

  if (phase === "loading" && !current) return <Status tone="loading" title="Loading jobs" />;
  if (phase === "forbidden") return <Status tone="forbidden" title="You do not have permission to view records" />;
  if (phase === "error") {
    return (
      <div className="grid gap-3">
        <Status tone="error" title="Could not load jobs" />
        <ActionRow>
          <Button onClick={() => void load()}>Retry</Button>
        </ActionRow>
      </div>
    );
  }

  return (
    <section className="grid gap-6" aria-labelledby="jobs-heading">
      <div className="grid gap-2">
        <nav aria-label="Breadcrumb" className="text-sm">
          <a href="/records">Records</a>
          <span aria-hidden="true"> / </span>
          <span>Export</span>
        </nav>
        <h1 id="jobs-heading" className="text-2xl font-semibold">
          Export
        </h1>
        <p className="text-sm text-muted">
          This demo updates a saved job from this API process. It is not a durable multi-server queue. Choose a
          simulated result. Retry starts a new attempt that runs to completion.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          id="job-outcome"
          label="Simulated result"
          value={outcome}
          onChange={(event) => setOutcome(event.target.value === "fail" ? "fail" : "complete")}
        >
          <option value="complete">Complete</option>
          <option value="fail">Fail</option>
        </SelectField>
        <ActionRow className="ml-auto" label="Job actions">
          <Button onClick={() => void start()}>Start export</Button>
        </ActionRow>
      </div>
      {!current ? <Status tone="empty" title="No export yet" detail="Start an export to watch its progress." /> : null}
      {current ? <JobState job={current} onCancel={() => void cancel()} onRetry={() => void retry()} /> : null}
    </section>
  );
}

function JobState({ job, onCancel, onRetry }: { job: Job; onCancel: () => void; onRetry: () => void }) {
  return (
    <div className="grid gap-4 rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-muted">Attempt {job.attempt}</p>
      {(job.status === "queued" || job.status === "running") && (
        <>
          <ProgressMeter value={job.progress} label="Export progress" />
          <ActionRow label="Job actions">
            <Button variant="danger" onClick={onCancel}>
              Cancel job
            </Button>
          </ActionRow>
        </>
      )}
      {job.status === "succeeded" ? <Status tone="success" title="Export finished" /> : null}
      {job.status === "cancelled" ? (
        <Status tone="empty" title="Export cancelled" detail="This attempt will not finish as a success." />
      ) : null}
      {job.status === "failed" ? (
        <div className="grid gap-3">
          <Status tone="error" title="Export failed" detail="Retry starts a new attempt." />
          <ActionRow label="Job actions">
            <Button onClick={onRetry}>Retry export</Button>
          </ActionRow>
        </div>
      ) : null}
    </div>
  );
}
