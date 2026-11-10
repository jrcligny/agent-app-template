import { hierarchyAttemptSchema, hierarchySchema } from "@agent-app/contracts";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { HierarchyPath, type HierarchyView } from "@/components/hierarchy/hierarchy-path";
import { ApiError, apiFetch } from "@/lib/api";

export function HierarchyPage() {
  const { collectionId = "" } = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const snapshotId = search.get("snapshot") ?? "";
  const itemId = search.get("item") ?? "";
  const attemptId = search.get("attempt") ?? "";
  const status = search.get("status") === "closed" ? "closed" : search.get("status") === "open" ? "open" : "";
  const [phase, setPhase] = useState<"loading" | "error" | "forbidden" | "ready">("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [path, setPath] = useState<HierarchyView | null>(null);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const pathRef = useRef<HierarchyView | null>(null);
  pathRef.current = path;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (pathRef.current) setRefreshing(true);
      else setPhase("loading");
      const params = new URLSearchParams({ collectionId });
      if (snapshotId) params.set("snapshotId", snapshotId);
      if (itemId) params.set("itemId", itemId);
      if (attemptId) params.set("attemptId", attemptId);
      if (status) params.set("status", status);
      try {
        const result = await apiFetch(`/api/hierarchy?${params.toString()}`, (value) => hierarchySchema.parse(value));
        if (cancelled) return;
        setPath(result);
        setPhase("ready");
      } catch (error) {
        if (cancelled) return;
        setPath(null);
        setPhase(error instanceof ApiError && error.status === 403 ? "forbidden" : "error");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [collectionId, snapshotId, itemId, attemptId, status]);

  function onBack() {
    const next = new URLSearchParams(search);
    if (next.has("attempt")) next.delete("attempt");
    else if (next.has("item")) next.delete("item");
    else if (next.has("snapshot")) next.delete("snapshot");
    else {
      void navigate("/collections");
      return;
    }
    setSearch(next);
    setFocusToken((value) => value + 1);
  }

  function onStatus(nextStatus: "" | "open" | "closed") {
    const next = new URLSearchParams(search);
    if (nextStatus) next.set("status", nextStatus);
    else next.delete("status");
    setSearch(next);
  }

  async function onSaveAttempt(label: string) {
    if (!path?.snapshot || !path.item) return false;
    if (label.trim().length === 0) {
      setLabelError("Enter an attempt label.");
      document.getElementById("attempt-label")?.focus();
      return false;
    }
    setLabelError(null);
    try {
      const saved = await apiFetch("/api/hierarchy/attempts", (value) => hierarchyAttemptSchema.parse(value), {
        method: "POST",
        body: JSON.stringify({ snapshotId: path.snapshot.id, itemId: path.item.id, label: label.trim() }),
      });
      const next = new URLSearchParams(search);
      next.set("snapshot", path.snapshot.id);
      next.set("item", path.item.id);
      next.set("attempt", saved.id);
      setSearch(next);
      return true;
    } catch (error) {
      setLabelError(error instanceof ApiError ? error.message : "Could not save the attempt");
      return false;
    }
  }

  return (
    <HierarchyPath
      phase={phase}
      path={path}
      refreshing={refreshing}
      status={status}
      labelError={labelError}
      focusToken={focusToken}
      onStatus={onStatus}
      onBack={onBack}
      onSaveAttempt={onSaveAttempt}
    />
  );
}
