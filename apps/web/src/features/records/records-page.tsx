import { collectionSchema, recordDetailSchema, recordPageSchema, savedViewSchema, type WorkbenchRecord } from "@agent-app/contracts";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CurationPanel } from "@/components/curation/curation-panel";
import { DataTable } from "@/components/data/data-table";
import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";
import { ConfirmDelete } from "./confirm-delete";
import { RecordDrawer } from "./record-drawer";

type Phase = "loading" | "ready" | "error" | "forbidden";

export function RecordsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const statusParam = params.get("status");
  const status = statusParam === "open" || statusParam === "closed" ? statusParam : "";
  const sort = params.get("sort") === "-title" ? "-title" : "title";
  const page = positive(params.get("page"));
  const drawerId = params.get("drawer");
  const tag = params.get("tag") ?? "";
  const collection = params.get("collection") ?? "";
  const category = params.get("category") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const [reloadKey, setReloadKey] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [rows, setRows] = useState<WorkbenchRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [canDelete, setCanDelete] = useState(true);
  const [canCurate, setCanCurate] = useState(true);
  const [membershipState, setMembershipState] = useState<"idle" | "loading" | "error" | "success" | "forbidden">("idle");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; title: string } | null>(null);
  const [drawerPhase, setDrawerPhase] = useState<"loading" | "error" | "ready">("loading");
  const [drawerRecord, setDrawerRecord] = useState<WorkbenchRecord | null>(null);
  const [pageSize, setPageSize] = useState(25);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  function replace(next: Record<string, string | null>) {
    const updated = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value.length === 0) updated.delete(key);
      else updated.set(key, value);
    }
    setParams(updated);
  }

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    const search = new URLSearchParams({ sort, page: String(page) });
    if (query) search.set("q", query);
    if (status) search.set("status", status);
    if (tag) search.set("tag", tag);
    if (collection) search.set("collection", collection);
    if (category) search.set("category", category);
    if (from) search.set("from", from);
    if (to) search.set("to", to);
    void apiFetch(`/api/records?${search.toString()}`, (value) => recordPageSchema.parse(value))
      .then((result) => {
        if (cancelled) return;
        setRows(result.records);
        setTotal(result.total);
        setPageSize(result.pageSize);
        setCanDelete(result.canDelete);
        setCanCurate(result.canCurate);
        setPhase("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setRows([]);
        setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [query, status, tag, collection, category, from, to, sort, page, reloadKey]);

  useEffect(() => {
    if (!drawerId) return;
    let cancelled = false;
    setDrawerPhase("loading");
    setDrawerRecord(null);
    void apiFetch(`/api/records/${drawerId}`, (value) => recordDetailSchema.parse(value))
      .then((record) => {
        if (cancelled) return;
        setDrawerRecord(record);
        setDrawerPhase("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setDrawerPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [drawerId]);

  async function confirmDelete() {
    const ids = pendingDelete;
    setPendingDelete([]);
    try {
      await apiFetch("/api/records/bulk-delete", () => undefined, {
        method: "POST",
        body: JSON.stringify({ ids }),
      });
      setSelected([]);
      setNotice({ tone: "success", title: ids.length === 1 ? "Record deleted" : `${ids.length} records deleted` });
      replace({ page: "1", drawer: null });
      setReloadKey((value) => value + 1);
    } catch (error) {
      const batch = error instanceof ApiError && error.status === 404;
      setNotice({
        tone: "error",
        title: batch ? "That batch was not applied." : "Could not delete the records",
      });
    }
  }

  async function tagSelected(name: string) {
    if (selected.length === 0) return;
    try {
      await apiFetch("/api/tags", () => undefined, {
        method: "POST",
        body: JSON.stringify({ name, ids: selected }),
      });
      setNotice({ tone: "success", title: "Tag applied" });
      replace({ tag: name, page: "1" });
      setReloadKey((value) => value + 1);
    } catch (error) {
      setNotice({
        tone: "error",
        title: error instanceof ApiError && error.status === 403 ? "You do not have permission to curate records" : "Could not apply the tag",
      });
    }
  }

  async function saveView(name: string) {
    try {
      await apiFetch("/api/views", (value) => savedViewSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({
          name,
          query: {
            ...(query ? { q: query } : {}),
            ...(status ? { status } : {}),
            ...(tag ? { tag } : {}),
            ...(collection ? { collection } : {}),
            sort,
            ...(page > 1 ? { page } : {}),
          },
        }),
      });
      setNotice({ tone: "success", title: "View saved" });
    } catch (error) {
      setMembershipState(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
      setNotice({
        tone: "error",
        title: error instanceof ApiError && error.status === 403 ? "You do not have permission to curate records" : "Could not save the view",
      });
    }
  }

  async function collectionIdFor(name: string): Promise<string> {
    if (activeCollection) return activeCollection;
    const created = await apiFetch("/api/collections", (value) => collectionSchema.parse(value), {
      method: "POST",
      body: JSON.stringify({ name: name.trim() || "Inbox" }),
    });
    setActiveCollection(created.id);
    replace({ collection: created.id, page: "1" });
    return created.id;
  }

  async function includeSelected(name: string) {
    if (selected.length === 0) return;
    setMembershipState("loading");
    try {
      const id = await collectionIdFor(name);
      await apiFetch(`/api/collections/${id}/membership`, () => undefined, {
        method: "POST",
        body: JSON.stringify({ action: "include", ids: selected }),
      });
      setMembershipState("success");
      setNotice({ tone: "success", title: "Membership updated" });
      setReloadKey((value) => value + 1);
    } catch (error) {
      setMembershipState(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
      setNotice({ tone: "error", title: "That batch was not applied." });
    }
  }

  async function annotateSelected(input: { name: string; rationale: string }) {
    if (selected.length === 0) return;
    setMembershipState("loading");
    try {
      const id = await collectionIdFor(input.name);
      await apiFetch(`/api/collections/${id}/membership`, () => undefined, {
        method: "POST",
        body: JSON.stringify({ action: "annotate", ids: selected, rationale: input.rationale }),
      });
      setMembershipState("success");
      setNotice({ tone: "success", title: "Membership updated" });
      setReloadKey((value) => value + 1);
    } catch (error) {
      setMembershipState(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
      setNotice({ tone: "error", title: "That batch was not applied." });
    }
  }

  return (
    <section className="grid gap-6" aria-labelledby="records-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-2">
          <h1 id="records-heading" className="text-2xl font-semibold">
            Records
          </h1>
          <p className="text-sm text-muted">Search, filter, and page only the records on your account.</p>
          {from || category ? (
            <p className="text-sm">
              Chart filters: {status || "any status"}
              {category ? `, category ${category}` : ""}
              {from ? `, from ${from}` : ""}
              {to ? ` to ${to}` : ""}.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/records/new" className="inline-flex min-h-11 items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-ink">
            New record
          </Link>
          <Link to="/wizard" className="inline-flex items-center text-sm underline">
            Guided wizard
          </Link>
        </div>
      </div>
      <CurationPanel
        canCurate={canCurate}
        membershipState={membershipState}
        onTag={(name) => void tagSelected(name)}
        onSaveView={(name) => void saveView(name)}
        onInclude={(name) => void includeSelected(name)}
        onAnnotate={(input) => void annotateSelected(input)}
      />
      {notice ? <Status tone={notice.tone} title={notice.title} /> : null}
      {phase === "loading" ? <Status tone="loading" title="Loading records" /> : null}
      {phase === "forbidden" ? <Status tone="forbidden" title="You do not have permission to view records" /> : null}
      {phase === "error" ? (
        <div className="grid gap-3">
          <Status tone="error" title="Could not load records" />
          <ActionRow>
            <Button onClick={() => setReloadKey((value) => value + 1)}>Retry</Button>
          </ActionRow>
        </div>
      ) : null}
      {phase === "ready" ? (
        <DataTable
          rows={rows}
          selectedIds={selected}
          onToggle={(id) =>
            setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
          }
          query={query}
          onQueryChange={(value) => {
            setSelected([]);
            replace({ q: value, page: "1" });
          }}
          status={status}
          onStatusChange={(value) => {
            setSelected([]);
            replace({ status: value, page: "1" });
          }}
          sort={sort}
          onSortChange={(value) => replace({ sort: value, page: "1" })}
          page={page}
          pageCount={pageCount}
          onPageChange={(next) => replace({ page: String(next) })}
          onOpen={(id) => replace({ drawer: id })}
          onBulkDelete={() => setPendingDelete(selected)}
          canDelete={canDelete}
          emptyTitle="No records match"
          emptyDetail="Try a different search. The search field stays available."
        />
      ) : null}
      <RecordDrawer
        open={Boolean(drawerId)}
        phase={drawerPhase}
        record={drawerRecord}
        onClose={() => replace({ drawer: null })}
      />
      <ConfirmDelete
        open={pendingDelete.length > 0}
        count={pendingDelete.length}
        onConfirm={() => void confirmDelete()}
        onDismiss={() => setPendingDelete([])}
      />
    </section>
  );
}

function positive(value: string | null): number {
  const parsed = Number(value ?? "1");
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
