import { coverageSchema, draftCollectionListSchema, draftDetailSchema, snapshotDiffSchema, snapshotListSchema, snapshotSchema, windowDiffSchema } from "@agent-app/contracts";
import { useEffect, useState, type FormEvent } from "react";
import { DiffTable, type DiffRow, type ProvenanceRow } from "@/components/comparison/diff-table";
import { CoverageTable, type CoverageReport } from "@/components/snapshots/coverage-table";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { ApiError, apiFetch } from "@/lib/api";

type Draft = {
  id: string;
  name: string;
  members: { id: string; title: string; status: "open" | "closed"; category: string }[];
};
type Published = {
  id: string;
  name: string;
  revision: number;
  members: { recordId: string; title: string }[];
};
type DraftCollection = { id: string; name: string; memberCount: number };

export function SnapshotsPage() {
  const [phase, setPhase] = useState<"loading" | "ready" | "error" | "forbidden" | "empty">("loading");
  const [collections, setCollections] = useState<DraftCollection[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [published, setPublished] = useState<Published | null>(null);
  const [coveragePhase, setCoveragePhase] = useState<"loading" | "error" | "ready">("ready");
  const [coverage, setCoverage] = useState<CoverageReport | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<{ id: string; name: string; revision: number }[]>([]);
  const [baselineId, setBaselineId] = useState("");
  const [laterId, setLaterId] = useState("");
  const [diffPhase, setDiffPhase] = useState<"loading" | "empty" | "error" | "ready" | "forbidden">("empty");
  const [diffRows, setDiffRows] = useState<DiffRow[]>([]);
  const [provenance, setProvenance] = useState<ProvenanceRow[]>([]);
  const [compared, setCompared] = useState(false);
  const [environmentName, setEnvironmentName] = useState("");
  const [configDigest, setConfigDigest] = useState("");
  const [codeVersion, setCodeVersion] = useState("");
  const [leftFrom, setLeftFrom] = useState("2026-01-15T00:00:00.000Z");
  const [leftTo, setLeftTo] = useState("2026-01-16T00:00:00.000Z");
  const [rightFrom, setRightFrom] = useState("2026-01-16T00:00:00.000Z");
  const [rightTo, setRightTo] = useState("2026-01-17T00:00:00.000Z");
  const [windowZone, setWindowZone] = useState<"UTC" | "Europe/Paris">("Europe/Paris");
  const [windowGrain, setWindowGrain] = useState<"hour" | "day">("day");
  const [windowPhase, setWindowPhase] = useState<"idle" | "loading" | "empty" | "error" | "ready" | "forbidden">("idle");
  const [windowDetail, setWindowDetail] = useState("");
  const [windowRows, setWindowRows] = useState<DiffRow[]>([]);

  async function loadCollections() {
    setPhase("loading");
    try {
      const result = await apiFetch("/api/collections", (value) => draftCollectionListSchema.parse(value));
      setCollections(result.collections);
      setPhase(result.collections.length === 0 ? "empty" : "ready");
    } catch (error) {
      setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  useEffect(() => {
    void loadCollections();
  }, []);

  async function openDraft(id: string) {
    setPublished(null);
    setCoverage(null);
    try {
      const result = await apiFetch(`/api/collections/${id}/draft`, (value) => draftDetailSchema.parse(value));
      setDraft(result);
      const listed = await apiFetch(`/api/snapshots?collectionId=${id}`, (value) => snapshotListSchema.parse(value));
      setSnapshots(listed.snapshots);
      setBaselineId(listed.snapshots[0]?.id ?? "");
      setLaterId(listed.snapshots.at(-1)?.id ?? "");
      setCompared(false);
    } catch (error) {
      setDraft(null);
      setPublishError(error instanceof ApiError && error.status === 403 ? "forbidden" : "Could not load the draft");
    }
  }

  async function compare() {
    setCompared(true);
    setDiffPhase("loading");
    try {
      const result = await apiFetch("/api/comparisons/snapshots", (value) => snapshotDiffSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({ baselineId, laterId }),
      });
      setDiffRows(result.rows);
      setProvenance(result.provenance);
      setDiffPhase(result.rows.length === 0 && result.provenance.length === 0 ? "empty" : "ready");
    } catch (error) {
      setDiffRows([]);
      setProvenance([]);
      setDiffPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  async function compareWindows() {
    setWindowPhase("loading");
    setWindowRows([]);
    try {
      const result = await apiFetch("/api/comparisons/windows", (value) => windowDiffSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({
          leftFrom,
          leftTo,
          rightFrom,
          rightTo,
          timeZone: windowZone,
          granularity: windowGrain,
        }),
      });
      setWindowRows(result.rows);
      const detail = `Left count ${result.leftCount}. Right count ${result.rightCount}. Timezone ${result.timeZone}. Granularity ${result.granularity}.`;
      setWindowDetail(detail);
      setWindowPhase(result.leftCount === 0 && result.rightCount === 0 && result.rows.length === 0 ? "empty" : "ready");
    } catch (error) {
      setWindowDetail(error instanceof ApiError ? error.message : "Request failed");
      setWindowPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  async function onPublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (name.trim().length === 0) {
      setNameError("Enter a publish name.");
      document.getElementById("publish-name")?.focus();
      return;
    }
    setNameError(null);
    setPublishError(null);
    const categories = target.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
    try {
      const result = await apiFetch("/api/snapshots", (value) => snapshotSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({
          collectionId: draft.id,
          name: name.trim(),
          ...(categories.length > 0 ? { target: categories } : {}),
          submitKey: crypto.randomUUID(),
          environmentName: environmentName.trim() || null,
          configDigest: configDigest.trim() || null,
          codeVersion: codeVersion.trim() || null,
        }),
      });
      setPublished(result);
      if (draft) {
        const listed = await apiFetch(`/api/snapshots?collectionId=${draft.id}`, (value) => snapshotListSchema.parse(value));
        setSnapshots(listed.snapshots);
        setLaterId(result.id);
        if (!baselineId) setBaselineId(listed.snapshots[0]?.id ?? result.id);
      }
      setCoveragePhase("loading");
      try {
        const report = await apiFetch(`/api/snapshots/${result.id}/coverage`, (value) => coverageSchema.parse(value));
        setCoverage(report);
        setCoveragePhase("ready");
      } catch {
        setCoverage(null);
        setCoveragePhase("error");
      }
    } catch (error) {
      setPublished(null);
      setPublishError(error instanceof ApiError && error.status === 403 ? "forbidden" : "Could not publish the snapshot");
    }
  }

  return (
    <section className="grid gap-6" aria-labelledby="snapshots-heading">
      <div className="grid gap-2">
        <h1 id="snapshots-heading" className="text-2xl font-semibold">Collections</h1>
        <p className="text-sm text-muted">
          A collection stays editable. Publishing freezes the titles, statuses, and categories from that moment.
        </p>
      </div>
      {phase === "loading" ? <Status tone="loading" title="Loading drafts" /> : null}
      {phase === "error" ? (
        <div className="grid gap-3">
          <Status tone="error" title="Could not load drafts" />
          <ActionRow>
            <Button onClick={() => void loadCollections()}>Retry</Button>
          </ActionRow>
        </div>
      ) : null}
      {phase === "forbidden" ? <Status tone="forbidden" title="You do not have permission to view records" /> : null}
      {phase === "empty" ? <Status tone="empty" title="No drafts" detail="Include records in a collection before publishing." /> : null}
      {phase === "ready" ? (
        <div className="flex flex-wrap gap-3">
          {collections.map((item) => (
            <Button key={item.id} variant={draft?.id === item.id ? "primary" : "quiet"} onClick={() => void openDraft(item.id)}>
              {item.name}
            </Button>
          ))}
        </div>
      ) : null}
      {draft ? (
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold">Draft</h2>
          <p className="text-sm">{draft.name} has {draft.members.length} live members.</p>
          {draft.members.length === 0 ? <Status tone="empty" title="No members" detail="This draft has no members yet." /> : null}
          <ul className="grid gap-2">
            {draft.members.map((member) => (
              <li key={member.id} className="rounded-md border border-line bg-surface p-3 text-sm">
                {member.title} · {member.status} · {member.category || "No category"}
              </li>
            ))}
          </ul>
          <form className="grid gap-3" onSubmit={onPublish}>
            <TextField
              id="publish-name"
              label="Publish name"
              value={name}
              error={nameError ?? undefined}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.form?.requestSubmit();
              }}
            />
            <TextField
              id="coverage-target"
              label="Coverage target"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
            <TextField id="environment-name" label="Environment name" value={environmentName} onChange={(event) => setEnvironmentName(event.target.value)} />
            <TextField id="config-digest" label="Config digest" value={configDigest} onChange={(event) => setConfigDigest(event.target.value)} />
            <TextField id="code-version" label="Code version" value={codeVersion} onChange={(event) => setCodeVersion(event.target.value)} />
            <p className="text-sm text-muted">Provenance is optional. A blank field is stored as missing, not as a default.</p>
            <ActionRow label="Publish actions">
              <Button type="submit">Publish snapshot</Button>
            </ActionRow>
          </form>
        </div>
      ) : null}
      {publishError === "forbidden" ? <Status tone="forbidden" title="You do not have permission to curate records" /> : null}
      {publishError && publishError !== "forbidden" ? <Status tone="error" title={publishError} /> : null}
      {published ? (
        <div className="grid gap-4">
          <Status tone="success" title="Snapshot published" detail={`${published.name} is revision ${published.revision}. Later edits to the source records stay out of this copy.`} />
          <p className="w-fit rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium">Immutable</p>
          <h2 className="text-lg font-semibold">Published members</h2>
          {published.members.length === 0 ? <Status tone="empty" title="No members" detail="This published snapshot has no members." /> : null}
          <ul className="grid gap-2">
            {published.members.map((member) => (
              <li key={member.recordId} className="rounded-md border border-line bg-surface p-3 text-sm">
                {member.title}
              </li>
            ))}
          </ul>
          <CoverageTable phase={coveragePhase} report={coverage} />
        </div>
      ) : null}
      {snapshots.length > 0 ? (
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void compare();
          }}
        >
          <h2 className="text-lg font-semibold">Compare snapshots</h2>
          <p className="text-sm text-muted">The baseline is the earlier frozen copy. Only title, status, and category are compared.</p>
          <SelectField id="baseline-snapshot" label="Baseline" value={baselineId} onChange={(event) => setBaselineId(event.target.value)}>
            {snapshots.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} revision {item.revision}
              </option>
            ))}
          </SelectField>
          <SelectField id="later-snapshot" label="Later snapshot" value={laterId} onChange={(event) => setLaterId(event.target.value)}>
            {snapshots.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} revision {item.revision}
              </option>
            ))}
          </SelectField>
          <ActionRow label="Compare actions">
            <Button type="submit">Compare</Button>
          </ActionRow>
        </form>
      ) : null}
      {compared ? <DiffTable phase={diffPhase} rows={diffRows} provenance={provenance} /> : null}
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void compareWindows();
        }}
      >
        <h2 className="text-lg font-semibold">Compare observation windows</h2>
        <p className="text-sm text-muted">
          Each window starts at from, inclusive, and ends at to, exclusive. Instants are UTC. Day and hour labels use the selected timezone, which defaults to Europe/Paris. A count of zero is a measured zero, not an unknown value.
        </p>
        <TextField id="left-from" label="Left from (UTC)" value={leftFrom} onChange={(event) => setLeftFrom(event.target.value)} />
        <TextField id="left-to" label="Left to (UTC)" value={leftTo} onChange={(event) => setLeftTo(event.target.value)} />
        <TextField id="right-from" label="Right from (UTC)" value={rightFrom} onChange={(event) => setRightFrom(event.target.value)} />
        <TextField id="right-to" label="Right to (UTC)" value={rightTo} onChange={(event) => setRightTo(event.target.value)} />
        <SelectField id="window-zone" label="Timezone" value={windowZone} onChange={(event) => setWindowZone(event.target.value === "UTC" ? "UTC" : "Europe/Paris")}>
          <option value="Europe/Paris">Europe/Paris</option>
          <option value="UTC">UTC</option>
        </SelectField>
        <SelectField id="window-grain" label="Granularity" value={windowGrain} onChange={(event) => setWindowGrain(event.target.value === "hour" ? "hour" : "day")}>
          <option value="day">Day</option>
          <option value="hour">Hour</option>
        </SelectField>
        <ActionRow label="Window actions">
          <Button type="submit">Compare windows</Button>
        </ActionRow>
      </form>
      {windowPhase === "loading" ? <Status tone="loading" title="Loading window comparison" /> : null}
      {windowPhase === "error" ? <Status tone="error" title="Could not compare windows" detail={windowDetail} /> : null}
      {windowPhase === "forbidden" ? <Status tone="forbidden" title="You do not have permission to view records" /> : null}
      {windowPhase === "empty" ? <Status tone="empty" title="No observations" detail={windowDetail} /> : null}
      {windowPhase === "ready" ? (
        <div className="grid gap-3">
          <Status tone="success" title="Window comparison ready" detail={windowDetail} />
          <DiffTable phase="ready" rows={windowRows} provenance={[]} />
        </div>
      ) : null}
    </section>
  );
}
