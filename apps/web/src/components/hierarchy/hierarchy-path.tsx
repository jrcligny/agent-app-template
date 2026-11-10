import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";

export type HierarchyAttempt = { id: string; label: string; attemptedAt: string };
export type HierarchyItem = {
  id: string;
  title: string;
  status: "open" | "closed";
  category: string;
  attempts: HierarchyAttempt[];
};
export type HierarchySnapshot = { id: string; name: string; revision: number };
export type HierarchyCollection = { id: string; name: string };

export type HierarchyView = {
  collection: HierarchyCollection;
  snapshots: HierarchySnapshot[];
  snapshot: HierarchySnapshot | null;
  items: { id: string; title: string; status: "open" | "closed"; category: string }[];
  item: HierarchyItem | null;
  attempt: HierarchyAttempt | null;
  status: "" | "open" | "closed";
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatUtc(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hours}:${minutes} UTC`;
}

export function HierarchyPath({
  phase,
  path,
  refreshing,
  status,
  labelError,
  focusToken,
  onStatus,
  onBack,
  onSaveAttempt,
}: {
  phase: "loading" | "error" | "forbidden" | "ready";
  path: HierarchyView | null;
  refreshing: boolean;
  status: "" | "open" | "closed";
  labelError: string | null;
  focusToken: number;
  onStatus: (status: "" | "open" | "closed") => void;
  onBack: () => void;
  onSaveAttempt: (label: string) => Promise<boolean>;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [label, setLabel] = useState("");
  const headingId = useId();

  useEffect(() => {
    if (focusToken > 0) listRef.current?.focus();
  }, [focusToken]);

  if (phase === "loading") return <Status tone="loading" title="Loading path" />;
  if (phase === "error") return <Status tone="error" title="Could not open this path" />;
  if (phase === "forbidden") return <Status tone="forbidden" title="You do not have permission to view records" />;
  if (!path) return <Status tone="error" title="Could not open this path" />;

  const listLabel = path.item ? "Attempts" : path.snapshot ? "Items" : "Snapshots";
  const currentName = path.attempt?.label ?? path.item?.title ?? path.snapshot?.name ?? path.collection.name;

  return (
    <section className="grid gap-6" aria-labelledby={headingId}>
      <div className="grid gap-2">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link to="/collections">Collections</Link>
          <Crumb current={!path.snapshot} href={collectionHref(path, status)}>{path.collection.name}</Crumb>
          {path.snapshot ? <Crumb current={!path.item} href={snapshotHref(path, status)}>{path.snapshot.name}</Crumb> : null}
          {path.item ? <Crumb current={!path.attempt} href={itemHref(path, status)}>{path.item.title}</Crumb> : null}
          {path.attempt ? <Crumb current href={attemptHref(path, status)}>{path.attempt.label}</Crumb> : null}
        </nav>
        <h1 id={headingId} className="text-2xl font-semibold">{currentName}</h1>
        <p className="text-sm text-muted">Titles, statuses, and categories are the copies stored when the snapshot was published.</p>
      </div>
      {refreshing ? <Status tone="loading" title="Loading path" /> : null}
      <div data-hierarchy-layout className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="grid w-full gap-3 lg:w-80">
          <SelectField
            id="hierarchy-status"
            label="Status"
            value={status}
            onChange={(event) => onStatus(event.target.value === "closed" ? "closed" : event.target.value === "open" ? "open" : "")}
          >
            <option value="">Any status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </SelectField>
          {path.snapshot ? <p className="text-sm">{path.items.length === 1 ? "1 item" : `${path.items.length} items`}</p> : null}
          <ul ref={listRef} tabIndex={-1} aria-label={listLabel} className="grid gap-2 outline-none focus-visible:ring-2 focus-visible:ring-focus">
            {entries(path).map((entry) => (
              <li key={entry.id}>
                <Link to={entry.href} className="text-sm font-medium underline" aria-current={entry.current ? "page" : undefined}>
                  {entry.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid min-w-0 flex-1 gap-4">
          <ActionRow label="Path actions">
            <Button
              variant="quiet"
              onClick={onBack}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onBack();
              }}
            >
              Back
            </Button>
          </ActionRow>
          {path.attempt ? (
            <div className="grid gap-3">
              <Status tone="success" title="Attempt opened" detail={formatUtc(path.attempt.attemptedAt)} />
              <p className="text-sm">Item: {path.item?.title}</p>
            </div>
          ) : null}
          {path.item && !path.attempt ? (
            <div className="grid gap-3">
              <Status tone="success" title="Item opened" detail={`${path.item.status} · ${path.item.category || "No category"}`} />
              {path.item.attempts.length === 0 ? <Status tone="empty" title="No attempts" detail="This item has no stored attempts." /> : null}
            </div>
          ) : null}
          {path.snapshot && !path.item ? <Status tone="success" title="Snapshot opened" detail={`${path.snapshot.name} is revision ${path.snapshot.revision}.`} /> : null}
          {!path.snapshot ? <Status tone="success" title="Collection opened" detail="Choose a snapshot to see its copied items." /> : null}
          {path.item ? (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                void submitAttempt(event, label, onSaveAttempt, setLabel);
              }}
            >
              <TextField
                id="attempt-label"
                label="Attempt label"
                value={label}
                error={labelError ?? undefined}
                onChange={(event) => setLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.form?.requestSubmit();
                }}
              />
              <ActionRow label="Attempt actions">
                <Button type="submit">Save attempt</Button>
              </ActionRow>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Crumb({ href, current, children }: { href: string; current: boolean; children: string }) {
  return (
    <>
      <span aria-hidden="true"> / </span>
      {current ? <span>{children}</span> : <Link to={href}>{children}</Link>}
    </>
  );
}

function entries(path: HierarchyView): { id: string; label: string; href: string; current: boolean }[] {
  if (path.item) {
    return path.item.attempts.map((attempt) => ({
      id: attempt.id,
      label: attempt.label,
      href: attemptHref({ ...path, attempt }, path.status),
      current: path.attempt?.id === attempt.id,
    }));
  }
  if (path.snapshot) {
    return path.items.map((item) => ({
      id: item.id,
      label: item.title,
      href: itemHref({ ...path, item: { ...item, attempts: [] } }, path.status),
      current: false,
    }));
  }
  return path.snapshots.map((item) => ({
    id: item.id,
    label: `${item.name} revision ${item.revision}`,
    href: snapshotHref({ ...path, snapshot: item }, path.status),
    current: false,
  }));
}

async function submitAttempt(
  event: FormEvent<HTMLFormElement>,
  label: string,
  onSaveAttempt: (label: string) => Promise<boolean>,
  setLabel: (value: string) => void,
) {
  event.preventDefault();
  const saved = await onSaveAttempt(label);
  if (saved) setLabel("");
}

function collectionHref(path: HierarchyView, status: string) {
  return withStatus(`/collections/${path.collection.id}`, status);
}

function snapshotHref(path: HierarchyView, status: string) {
  if (!path.snapshot) return collectionHref(path, status);
  return withStatus(`/collections/${path.collection.id}?snapshot=${path.snapshot.id}`, status);
}

function itemHref(path: HierarchyView, status: string) {
  if (!path.snapshot || !path.item) return snapshotHref(path, status);
  return withStatus(`/collections/${path.collection.id}?snapshot=${path.snapshot.id}&item=${path.item.id}`, status);
}

function attemptHref(path: HierarchyView, status: string) {
  if (!path.snapshot || !path.item || !path.attempt) return itemHref(path, status);
  return withStatus(
    `/collections/${path.collection.id}?snapshot=${path.snapshot.id}&item=${path.item.id}&attempt=${path.attempt.id}`,
    status,
  );
}

function withStatus(href: string, status: string) {
  if (status !== "open" && status !== "closed") return href;
  return `${href}${href.includes("?") ? "&" : "?"}status=${status}`;
}
