import { coverageSchema, draftCollectionListSchema, draftDetailSchema, snapshotSchema } from "@agent-app/contracts";
import { useEffect, useState, type FormEvent } from "react";
import { CoverageTable, type CoverageReport } from "@/components/snapshots/coverage-table";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
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
    } catch (error) {
      setDraft(null);
      setPublishError(error instanceof ApiError && error.status === 403 ? "forbidden" : "Could not load the draft");
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
        }),
      });
      setPublished(result);
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
    </section>
  );
}
