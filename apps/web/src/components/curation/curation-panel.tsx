import { useState } from "react";
import { useSearchParams } from "react-router";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export function CurationPanel({
  canCurate = true,
  membershipState = "idle",
  onTag,
  onSaveView,
  onInclude,
  onAnnotate,
}: {
  canCurate?: boolean;
  membershipState?: "idle" | "loading" | "error" | "success" | "forbidden";
  onTag?: (name: string) => void;
  onSaveView?: (name: string) => void;
  onInclude?: (name: string) => void;
  onAnnotate?: (input: { name: string; rationale: string }) => void;
}) {
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag") ?? "";
  const collection = params.get("collection") ?? "";
  const status = params.get("status") ?? "any";
  const [viewName, setViewName] = useState("");
  const [viewError, setViewError] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [rationale, setRationale] = useState("");
  const [rationaleError, setRationaleError] = useState<string | null>(null);
  const [tagToApply, setTagToApply] = useState("");

  function write(next: Record<string, string | null>) {
    const updated = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value) updated.delete(key);
      else updated.set(key, value);
    }
    updated.delete("page");
    setParams(updated);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm">
        Filters: status {status}, tag {tag || "any"}, collection {collection || "any"}.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <TextField
          id="record-tag"
          label="Tag"
          value={tag}
          onChange={(event) => write({ tag: event.target.value.toLowerCase() })}
        />
        <TextField
          id="tag-to-apply"
          label="Tag to apply"
          value={tagToApply}
          onChange={(event) => setTagToApply(event.target.value.toLowerCase())}
        />
        <ActionRow label="Tag actions">
          <Button
            onClick={() => {
              if (tagToApply) onTag?.(tagToApply);
            }}
          >
            Apply tag
          </Button>
        </ActionRow>
        <TextField
          id="view-name"
          label="View name"
          value={viewName}
          error={viewError ?? undefined}
          onChange={(event) => setViewName(event.target.value)}
        />
        <ActionRow label="View actions">
          <Button
            onClick={() => {
              if (viewName.trim().length === 0) {
                setViewError("Enter a view name.");
                document.getElementById("view-name")?.focus();
                return;
              }
              setViewError(null);
              onSaveView?.(viewName.trim());
            }}
          >
            Save view
          </Button>
        </ActionRow>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <TextField
          id="collection-name"
          label="Collection"
          value={collectionName}
          onChange={(event) => setCollectionName(event.target.value)}
        />
        <TextField
          id="membership-rationale"
          label="Rationale"
          value={rationale}
          error={rationaleError ?? undefined}
          onChange={(event) => setRationale(event.target.value)}
        />
        <ActionRow className="ml-auto" label="Membership">
        <Button onClick={() => onInclude?.(collectionName)}>Include in collection</Button>
        <Button
          onClick={() => {
            if (rationale.trim().length === 0) {
              setRationaleError("Enter a rationale.");
              document.getElementById("membership-rationale")?.focus();
              return;
            }
            setRationaleError(null);
            onAnnotate?.({ name: collectionName, rationale: rationale.trim() });
          }}
        >
          Annotate membership
        </Button>
        </ActionRow>
      </div>
      {membershipState === "loading" ? <p role="status">Updating membership</p> : null}
      {membershipState === "forbidden" || !canCurate ? (
        <p role="alert">You do not have permission to curate records</p>
      ) : null}
    </div>
  );
}
