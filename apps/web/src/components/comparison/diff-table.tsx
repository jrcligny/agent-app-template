import { Status } from "@/components/feedback/status";

export type DiffRow = {
  id: string;
  kind: "added" | "removed" | "changed";
  fields: string[];
  leftTitle: string | null;
  rightTitle: string | null;
};

export type ProvenanceRow = {
  field: "environmentName" | "configDigest" | "codeVersion";
  left: string | null;
  right: string | null;
};

const kindLabel = { added: "Added", removed: "Removed", changed: "Changed" };

export function DiffTable({
  phase,
  rows,
  provenance,
}: {
  phase: "loading" | "empty" | "error" | "ready" | "forbidden";
  rows: DiffRow[];
  provenance: ProvenanceRow[];
}) {
  if (phase === "loading") return <Status tone="loading" title="Loading comparison" />;
  if (phase === "error") return <Status tone="error" title="Could not compare" />;
  if (phase === "forbidden") return <Status tone="forbidden" title="You do not have permission to view records" />;
  if (phase === "empty" || (rows.length === 0 && provenance.length === 0)) {
    return <Status tone="empty" title="No differences" detail="The two sides have the same ids and copied fields." />;
  }
  return (
    <div className="grid gap-4">
      <Status tone="success" title="Comparison ready" detail="Added, removed, and changed are named in the table." />
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="p-3 text-left font-medium">Differences</caption>
          <thead>
            <tr className="border-b border-line">
              <th className="p-3" scope="col">Change</th>
              <th className="p-3" scope="col">Baseline</th>
              <th className="p-3" scope="col">Later</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="p-3">
                  <button type="button" className="text-left">
                    {kindLabel[row.kind]}
                    {row.fields.length > 0 ? ` ${row.fields.join(", ")}` : ""}
                  </button>
                </td>
                <td className="p-3">{row.leftTitle ?? ""}</td>
                <td className="p-3">{row.rightTitle ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {provenance.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="p-3 text-left font-medium">Provenance</caption>
            <thead>
              <tr className="border-b border-line">
                <th className="p-3" scope="col">Field</th>
                <th className="p-3" scope="col">Baseline</th>
                <th className="p-3" scope="col">Later</th>
              </tr>
            </thead>
            <tbody>
              {provenance.map((row) => (
                <tr key={row.field}>
                  <td className="p-3">
                    <button type="button">{row.field}</button>
                  </td>
                  <td className="p-3">{row.left ?? ""}</td>
                  <td className="p-3">{row.right ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
