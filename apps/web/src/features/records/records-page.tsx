import { recordDetailSchema, recordPageSchema, type WorkbenchRecord } from "@agent-app/contracts";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { DataTable } from "@/components/data/data-table";
import { Status } from "@/components/feedback/status";
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
  const [reloadKey, setReloadKey] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [rows, setRows] = useState<WorkbenchRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [canDelete, setCanDelete] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; title: string } | null>(null);
  const [drawerPhase, setDrawerPhase] = useState<"loading" | "error" | "ready">("loading");
  const [drawerRecord, setDrawerRecord] = useState<WorkbenchRecord | null>(null);
  const pageSize = 20;
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
    const search = new URLSearchParams({ sort, page: String(page), pageSize: String(pageSize) });
    if (query) search.set("q", query);
    if (status) search.set("status", status);
    void apiFetch(`/api/records?${search.toString()}`, (value) => recordPageSchema.parse(value))
      .then((result) => {
        if (cancelled) return;
        setRows(result.records);
        setTotal(result.total);
        setCanDelete(result.canDelete);
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
  }, [query, status, sort, page, reloadKey]);

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

  return (
    <section className="grid gap-6" aria-labelledby="records-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-2">
          <h1 id="records-heading" className="text-2xl font-semibold">
            Records
          </h1>
          <p className="text-sm text-muted">Search, filter, and page only the records on your account.</p>
        </div>
        <Link to="/records/new" className="inline-flex rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-ink">
          New record
        </Link>
      </div>
      {notice ? <Status tone={notice.tone} title={notice.title} /> : null}
      {phase === "loading" ? <Status tone="loading" title="Loading records" /> : null}
      {phase === "forbidden" ? <Status tone="forbidden" title="You do not have permission to view records" /> : null}
      {phase === "error" ? (
        <div className="grid gap-3">
          <Status tone="error" title="Could not load records" />
          <Button onClick={() => setReloadKey((value) => value + 1)}>Retry</Button>
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
