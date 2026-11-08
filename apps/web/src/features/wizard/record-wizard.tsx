import { recordSchema } from "@agent-app/contracts";
import { useState } from "react";
import { Link } from "react-router";
import { Status } from "@/components/feedback/status";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { WizardFrame } from "@/components/wizard/wizard-frame";
import { ApiError, apiFetch } from "@/lib/api";

type StatusValue = "open" | "closed";

export function RecordWizard() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<StatusValue>("open");
  const [reason, setReason] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"editing" | "saving" | "success" | "error" | "forbidden">("editing");

  function nextFromTitle() {
    if (title.trim().length === 0) {
      setTitleError("Enter a title.");
      document.getElementById("wizard-title")?.focus();
      return;
    }
    setTitleError(null);
    setStep(2);
  }

  function nextFromStatus() {
    if (status === "closed" && reason.trim().length === 0) {
      setReasonError("Enter a reason for closing the record.");
      document.getElementById("wizard-reason")?.focus();
      return;
    }
    setReasonError(null);
    setStep(3);
  }

  async function finish() {
    setPhase("saving");
    try {
      await apiFetch("/api/records", (value) => recordSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          status,
          summary: "",
          body: "",
          ...(status === "closed" ? { reason: reason.trim() } : {}),
        }),
      });
      setPhase("success");
    } catch (error) {
      setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  if (phase === "forbidden") return <Status tone="forbidden" title="You do not have permission to view records" />;
  if (phase === "error") return <Status tone="error" title="Could not create the record" />;
  if (phase === "success") {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold">Record created</h1>
        <Status tone="success" title="Record created" detail="The wizard finished on a valid record." />
        <Link to="/records" className="text-sm underline">
          Back to records
        </Link>
      </div>
    );
  }

  if (step === 1) {
    return (
      <WizardFrame step={1} total={3} title="Record title" nextLabel="Next" onNext={nextFromTitle}>
        <TextField
          id="wizard-title"
          label="Title"
          value={title}
          error={titleError ?? undefined}
          onChange={(event) => setTitle(event.target.value)}
        />
      </WizardFrame>
    );
  }

  if (step === 2) {
    return (
      <WizardFrame step={2} total={3} title="Record status" nextLabel="Next" onBack={() => setStep(1)} onNext={nextFromStatus}>
        <div className="grid gap-4">
          <SelectField
            id="wizard-status"
            label="Status"
            value={status}
            onChange={(event) => {
              const next = event.target.value === "closed" ? "closed" : "open";
              setStatus(next);
              if (next === "open") setReason("");
            }}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </SelectField>
          {status === "closed" ? (
            <TextField
              id="wizard-reason"
              label="Reason"
              value={reason}
              error={reasonError ?? undefined}
              onChange={(event) => setReason(event.target.value)}
            />
          ) : null}
        </div>
      </WizardFrame>
    );
  }

  return (
    <WizardFrame
      step={3}
      total={3}
      title="Review"
      nextLabel={phase === "saving" ? "Saving" : "Finish"}
      onBack={() => setStep(2)}
      onNext={() => void finish()}
    >
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="text-muted">Title</dt>
          <dd>{title.trim()}</dd>
        </div>
        <div>
          <dt className="text-muted">Status</dt>
          <dd>{status}</dd>
        </div>
        {status === "closed" ? (
          <div>
            <dt className="text-muted">Reason</dt>
            <dd>{reason.trim()}</dd>
          </div>
        ) : null}
      </dl>
    </WizardFrame>
  );
}
