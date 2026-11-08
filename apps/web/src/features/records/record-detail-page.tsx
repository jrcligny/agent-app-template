import { recordDetailSchema, type RecordDetail } from "@agent-app/contracts";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { EvidencePanel } from "@/components/evidence/evidence-panel";
import { Status } from "@/components/feedback/status";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";
import { ConfirmDelete } from "./confirm-delete";

type Phase = "loading" | "ready" | "error" | "forbidden";

export function RecordDetailPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const saved = Boolean((location.state as { saved?: boolean } | null)?.saved);
  const [phase, setPhase] = useState<Phase>("loading");
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(saved ? "Record saved" : null);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    setPhase("loading");
    void apiFetch(`/api/records/${params.id}`, (value) => recordDetailSchema.parse(value))
      .then((result) => {
        if (cancelled) return;
        setRecord(result);
        setPhase("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function confirmDelete() {
    if (!record) return;
    setConfirming(false);
    try {
      await apiFetch("/api/records/bulk-delete", () => undefined, {
        method: "POST",
        body: JSON.stringify({ ids: [record.id] }),
      });
      navigate("/records", { state: { deleted: true } });
    } catch {
      setNotice(null);
      setPhase("error");
    }
  }

  if (phase === "loading") return <Status tone="loading" title="Loading record" />;
  if (phase === "forbidden") return <Status tone="forbidden" title="You do not have permission to view records" />;
  if (phase === "error" || !record) return <Status tone="error" title="Could not load the record" />;

  return (
    <article className="grid gap-6" aria-labelledby="record-detail-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <h1 id="record-detail-heading" className="text-2xl font-semibold">
            {record.title}
          </h1>
          <p className="text-sm text-muted">
            {record.status} · Owner {record.ownerName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/records/${record.id}/edit`} className="inline-flex items-center text-sm underline">
            Edit record
          </Link>
          {record.canDelete ? (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              Delete record
            </Button>
          ) : null}
        </div>
      </div>
      {notice ? <Status tone="success" title={notice} /> : null}
      <section className="grid gap-2">
        <h2 className="text-base font-semibold">Summary</h2>
        <p>{record.summary || "No summary."}</p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-base font-semibold">Body</h2>
        <p className="whitespace-pre-wrap">{record.body || "No body."}</p>
      </section>
      {record.reason ? (
        <section className="grid gap-2">
          <h2 className="text-base font-semibold">Reason</h2>
          <p>{record.reason}</p>
        </section>
      ) : null}
      <EvidencePanel recordId={record.id} />
      <Link to="/records" className="text-sm underline">
        Back to records
      </Link>
      <ConfirmDelete
        open={confirming}
        count={1}
        onConfirm={() => void confirmDelete()}
        onDismiss={() => setConfirming(false)}
      />
    </article>
  );
}
