import {
  artifactListSchema,
  artifactMetadataSchema,
  sectionListSchema,
  sectionNodeSchema,
  type SectionNode,
} from "@agent-app/contracts";
import { useEffect, useState, type FormEvent } from "react";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ApiError, apiFetch } from "@/lib/api";
import { SectionTree } from "./section-tree";

export function EvidencePanel({ recordId }: { recordId: string }) {
  const [sectionPhase, setSectionPhase] = useState<"loading" | "empty" | "error" | "ready" | "forbidden">("loading");
  const [sections, setSections] = useState<SectionNode[]>([]);
  const [artifacts, setArtifacts] = useState<{ id: string; fileName: string; mediaType: string; byteSize: number; contentPath: string }[]>([]);
  const [artifactPhase, setArtifactPhase] = useState<"loading" | "empty" | "error" | "ready" | "forbidden">("loading");
  const [title, setTitle] = useState("Context");
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setSectionPhase("loading");
    setArtifactPhase("loading");
    try {
      const sectionResult = await apiFetch(`/api/records/${recordId}/sections`, (value) => sectionListSchema.parse(value));
      setSections(sectionResult.sections);
      setSectionPhase(sectionResult.sections.length === 0 ? "empty" : "ready");
    } catch (error) {
      setSectionPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
    try {
      const artifactResult = await apiFetch(`/api/records/${recordId}/artifacts`, (value) => artifactListSchema.parse(value));
      setArtifacts(artifactResult.artifacts);
      setArtifactPhase(artifactResult.artifacts.length === 0 ? "empty" : "ready");
    } catch (error) {
      setArtifactPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  useEffect(() => {
    void load();
  }, [recordId]);

  async function onSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await apiFetch(`/api/records/${recordId}/sections`, (value) => sectionNodeSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({ title, text }),
      });
      setText("");
      setNotice("Section added");
      await load();
    } catch (error) {
      setNotice(null);
      setSectionPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  async function onFile(file: File) {
    const mediaType = file.type === "image/png" || file.type === "image/jpeg" ? file.type : "text/plain";
    const contentBase64 = await fileToBase64(file);
    try {
      await apiFetch(`/api/records/${recordId}/artifacts`, (value) => artifactMetadataSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, mediaType, contentBase64 }),
      });
      setNotice("File stored");
      await load();
    } catch (error) {
      setNotice(null);
      setArtifactPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
    }
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-3" aria-labelledby="sections-heading">
        <h2 id="sections-heading" className="text-lg font-semibold">
          Sections
        </h2>
        {sectionPhase === "forbidden" ? (
          <Status tone="forbidden" title="You do not have permission to view records" />
        ) : (
          <SectionTree phase={sectionPhase} sections={sections} />
        )}
        <form className="grid gap-3" onSubmit={onSection}>
          <TextField id="section-title" label="Section title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <TextField id="section-text" label="Section text" value={text} onChange={(event) => setText(event.target.value)} />
          <ActionRow>
            <Button type="submit">Add section</Button>
          </ActionRow>
        </form>
      </section>
      <section className="grid gap-3" aria-labelledby="artifacts-heading">
        <h2 id="artifacts-heading" className="text-lg font-semibold">
          Files
        </h2>
        {artifactPhase === "loading" ? <Status tone="loading" title="Loading files" /> : null}
        {artifactPhase === "empty" ? <Status tone="empty" title="No files" detail="Logs and images are stored with this record." /> : null}
        {artifactPhase === "error" ? <Status tone="error" title="Could not load files" /> : null}
        {artifactPhase === "forbidden" ? <Status tone="forbidden" title="You do not have permission to use files" /> : null}
        {artifactPhase === "ready" ? (
          <ul className="grid gap-3">
            {artifacts.map((artifact) => (
              <li key={artifact.id} className="rounded-md border border-line bg-surface p-3">
                <p className="break-words text-sm font-medium">{artifact.fileName}</p>
                <p className="text-sm text-muted">
                  {artifact.mediaType} · {artifact.byteSize} bytes
                </p>
                {artifact.mediaType.startsWith("image/") ? (
                  <img className="mt-2 max-w-full" src={artifact.contentPath} alt={artifact.fileName} />
                ) : (
                  <a className="text-sm underline" href={artifact.contentPath}>
                    Open log
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        <label className="grid gap-1 text-sm" htmlFor="artifact-file">
          Upload file
          <input
            id="artifact-file"
            type="file"
            accept="text/plain,image/png,image/jpeg"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
        </label>
      </section>
      {notice ? <Status tone="success" title={notice} /> : null}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
