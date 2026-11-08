import type { WorkbenchRecord } from "@agent-app/contracts";
import { Link } from "react-router";
import { Status } from "@/components/feedback/status";
import { Drawer } from "@/components/overlay/drawer";

export function RecordDrawer({
  open,
  phase,
  record,
  onClose,
}: {
  open: boolean;
  phase: "loading" | "error" | "ready";
  record: WorkbenchRecord | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} title={record?.title ?? "Record summary"} onClose={onClose}>
      {phase === "loading" ? <Status tone="loading" title="Loading record" /> : null}
      {phase === "error" ? <Status tone="error" title="Could not load the record" /> : null}
      {phase === "ready" && record ? (
        <div className="grid gap-3">
          <p>{record.summary || "No summary."}</p>
          <p className="text-sm text-muted">Owner: {record.ownerName}</p>
          <Link to={`/records/${record.id}`} className="text-sm font-medium underline">
            Open full record
          </Link>
        </div>
      ) : null}
    </Drawer>
  );
}
