import { activityPageSchema, type ActivityEvent } from "@agent-app/contracts";
import { useEffect, useState } from "react";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";

export function ActivityPage() {
  const [phase, setPhase] = useState<"loading" | "ready" | "error" | "forbidden">("loading");
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  async function load() {
    setPhase("loading");
    try {
      const result = await apiFetch("/api/activity", (value) => activityPageSchema.parse(value));
      setEvents(result.events);
      setPhase("ready");
    } catch (error) {
      setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="grid gap-6" aria-labelledby="activity-heading">
      <div className="grid gap-2">
        <h1 id="activity-heading" className="text-2xl font-semibold">
          Activity
        </h1>
        <p className="text-sm text-muted">Newest events for your records are first. Other accounts stay out of this list.</p>
      </div>
      {phase === "loading" ? <Status tone="loading" title="Loading activity" /> : null}
      {phase === "forbidden" ? <Status tone="forbidden" title="You do not have permission to view records" /> : null}
      {phase === "error" ? (
        <div className="grid gap-3">
          <Status tone="error" title="Could not load activity" />
          <ActionRow>
            <Button onClick={() => void load()}>Retry</Button>
          </ActionRow>
        </div>
      ) : null}
      {phase === "ready" && events.length === 0 ? (
        <Status tone="empty" title="No activity yet" detail="Creating or changing a record adds an event." />
      ) : null}
      {phase === "ready" && events.length > 0 ? (
        <ol className="grid gap-3">
          {events.map((event) => (
            <li key={event.id} className="rounded-lg border border-line bg-surface p-4">
              <p className="font-medium">{event.summary}</p>
              <p className="text-sm text-muted">{event.kind}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
