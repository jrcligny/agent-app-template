import { recordDetailSchema, recordSchema, recordWriteSchema, type WorkbenchRecord } from "@agent-app/contracts";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useBlocker, useNavigate, useParams } from "react-router";
import { Status } from "@/components/feedback/status";
import { ConfirmDialog } from "@/components/overlay/confirm-dialog";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { ApiError, apiFetch } from "@/lib/api";

type Fields = {
  title: string;
  status: "open" | "closed";
  summary: string;
  body: string;
  reason: string;
};

const emptyFields: Fields = { title: "", status: "open", summary: "", body: "", reason: "" };

export function RecordFormPage({ mode }: { mode: "create" | "edit" }) {
  const params = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [saved, setSaved] = useState<Fields>(emptyFields);
  const [phase, setPhase] = useState<"ready" | "loading" | "error" | "forbidden">(mode === "edit" ? "loading" : "ready");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const allowLeave = useRef(false);
  const recordId = mode === "edit" ? params.id : undefined;

  useEffect(() => {
    if (mode !== "edit" || !recordId) return;
    let cancelled = false;
    void apiFetch(`/api/records/${recordId}`, (value) => recordDetailSchema.parse(value))
      .then((record) => {
        if (cancelled) return;
        const next = fieldsFrom(record);
        setFields(next);
        setSaved(next);
        setPhase("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, recordId]);

  const dirty =
    fields.title !== saved.title ||
    fields.status !== saved.status ||
    fields.summary !== saved.summary ||
    fields.body !== saved.body ||
    fields.reason !== saved.reason;
  const blocker = useBlocker(() => !allowLeave.current && dirty);

  function update<Key extends keyof Fields>(key: Key, value: Fields[Key]) {
    setFields((current) => ({ ...current, [key]: value }));
    setSuccess(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = fields.title.trim();
    const reason = fields.reason.trim();
    if (!title) {
      setTitleError("Enter a title.");
      setReasonError(null);
      document.getElementById("record-title")?.focus();
      return;
    }
    if (fields.status === "closed" && !reason) {
      setTitleError(null);
      setReasonError("Enter a reason for closing the record.");
      document.getElementById("record-reason")?.focus();
      return;
    }
    setTitleError(null);
    setReasonError(null);
    const body = {
      title,
      status: fields.status,
      summary: fields.summary.trim(),
      body: fields.body,
      ...(fields.status === "closed" ? { reason } : {}),
    };
    const parsed = recordWriteSchema.safeParse(body);
    if (!parsed.success) {
      setReasonError("Enter a reason for closing the record.");
      document.getElementById("record-reason")?.focus();
      return;
    }
    try {
      const savedRecord = await apiFetch(
        mode === "create" ? "/api/records" : `/api/records/${recordId}`,
        (value) => recordSchema.parse(value),
        {
          method: mode === "create" ? "POST" : "PATCH",
          body: JSON.stringify(parsed.data),
        },
      );
      const next = fieldsFrom(savedRecord);
      setFields(next);
      setSaved(next);
      setSaveError(null);
      setSuccess("Record saved");
      if (mode === "create") {
        allowLeave.current = true;
        navigate(`/records/${savedRecord.id}`, { state: { saved: true } });
      }
    } catch (error) {
      setSuccess(null);
      if (error instanceof ApiError && error.status === 403) {
        setPhase("forbidden");
        return;
      }
      setSaveError(error instanceof ApiError ? error.message : "Could not save the record");
    }
  }

  if (phase === "loading") return <Status tone="loading" title="Loading record" />;
  if (phase === "forbidden") return <Status tone="forbidden" title="You do not have permission to view records" />;
  if (phase === "error") return <Status tone="error" title="Could not save the record" />;

  return (
    <section className="grid gap-6" aria-labelledby="record-form-heading">
      <div className="grid gap-2">
        <nav aria-label="Breadcrumb" className="text-sm">
          <a href="/records">Records</a>
          <span aria-hidden="true"> / </span>
          <span>{mode === "create" ? "Full form" : "Edit record"}</span>
        </nav>
        <h1 id="record-form-heading" className="text-2xl font-semibold">
          {mode === "create" ? "New record" : "Edit record"}
        </h1>
        <p className="text-sm text-muted">A closed record needs a reason. Open records do not.</p>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <TextField
          id="record-title"
          label="Title"
          value={fields.title}
          error={titleError ?? undefined}
          onChange={(event) => update("title", event.target.value)}
        />
        <SelectField
          id="record-status"
          label="Status"
          value={fields.status}
          onChange={(event) => {
            const status = event.target.value === "closed" ? "closed" : "open";
            setFields((current) => ({ ...current, status, reason: status === "open" ? "" : current.reason }));
            setSuccess(null);
          }}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </SelectField>
        <TextField
          id="record-summary"
          label="Summary"
          value={fields.summary}
          onChange={(event) => update("summary", event.target.value)}
        />
        <TextField
          id="record-body"
          label="Body"
          multiline
          value={fields.body}
          onChange={(event) => update("body", event.target.value)}
        />
        {fields.status === "closed" ? (
          <TextField
            id="record-reason"
            label="Reason"
            value={fields.reason}
            error={reasonError ?? undefined}
            onChange={(event) => update("reason", event.target.value)}
          />
        ) : null}
        <ActionRow>
          <Link to="/records" className="inline-flex min-h-11 items-center text-sm underline">
            Back to records
          </Link>
          <Button type="submit">Save record</Button>
        </ActionRow>
      </form>
      {success ? <Status tone="success" title={success} /> : null}
      {saveError ? <Status tone="error" title={saveError} /> : null}
      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Leave without saving?"
        description="The record still has the last saved values until you confirm."
        confirmLabel="Leave page"
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
        onDismiss={() => {
          if (blocker.state === "blocked") blocker.reset();
        }}
      />
    </section>
  );
}

function fieldsFrom(record: WorkbenchRecord): Fields {
  return {
    title: record.title,
    status: record.status,
    summary: record.summary,
    body: record.body,
    reason: record.reason ?? "",
  };
}
