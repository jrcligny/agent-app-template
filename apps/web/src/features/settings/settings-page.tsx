import { settingsSchema, type Settings } from "@agent-app/contracts";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBlocker } from "react-router";
import { Status } from "@/components/feedback/status";
import { ConfirmDialog } from "@/components/overlay/confirm-dialog";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { apiFetch } from "@/lib/api";

const empty: Settings = { displayName: "", pageSize: 25 };

export function SettingsPage() {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [fields, setFields] = useState<Settings>(empty);
  const [saved, setSaved] = useState<Settings>(empty);
  const [nameError, setNameError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const allowLeave = useRef(false);

  useEffect(() => {
    void apiFetch("/api/settings", (value) => settingsSchema.parse(value))
      .then((result) => {
        setFields(result);
        setSaved(result);
        setPhase("ready");
      })
      .catch(() => setPhase("error"));
  }, []);

  const dirty = fields.displayName !== saved.displayName || fields.pageSize !== saved.pageSize;
  const blocker = useBlocker(() => !allowLeave.current && dirty);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fields.displayName.trim().length === 0) {
      setNameError("Enter a display name.");
      setSuccess(false);
      document.getElementById("settings-name")?.focus();
      return;
    }
    setNameError(null);
    const next = settingsSchema.parse({ displayName: fields.displayName.trim(), pageSize: fields.pageSize });
    const result = await apiFetch("/api/settings", (value) => settingsSchema.parse(value), {
      method: "PUT",
      body: JSON.stringify(next),
    });
    setFields(result);
    setSaved(result);
    setSuccess(true);
  }

  if (phase === "loading") return <Status tone="loading" title="Loading settings" />;
  if (phase === "error") return <Status tone="error" title="Could not load settings" />;

  return (
    <section className="grid gap-6" aria-labelledby="settings-heading">
      <div className="grid gap-2">
        <h1 id="settings-heading" className="text-2xl font-semibold">
          Settings
        </h1>
        <p className="text-sm text-muted">The display name is shown on your records. The page size is 10, 25, or 50.</p>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <TextField
          id="settings-name"
          label="Display name"
          value={fields.displayName}
          error={nameError ?? undefined}
          onChange={(event) => {
            setFields((current) => ({ ...current, displayName: event.target.value }));
            setSuccess(false);
          }}
        />
        <SelectField
          id="settings-page-size"
          label="Page size"
          value={String(fields.pageSize)}
          onChange={(event) => {
            const pageSize = Number(event.target.value) === 10 ? 10 : Number(event.target.value) === 50 ? 50 : 25;
            setFields((current) => ({ ...current, pageSize }));
            setSuccess(false);
          }}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </SelectField>
        <Button type="submit">Save settings</Button>
      </form>
      {success ? <Status tone="success" title="Settings saved" /> : null}
      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Leave without saving settings?"
        description="The saved display name and page size stay as they were."
        confirmLabel="Leave page"
        onConfirm={() => {
          allowLeave.current = true;
          if (blocker.state === "blocked") blocker.proceed();
        }}
        onDismiss={() => {
          if (blocker.state === "blocked") blocker.reset();
        }}
      />
    </section>
  );
}
