import { Status } from "@/components/feedback/status";

export type CoverageReport = {
  memberCount: number;
  target: string[] | null;
  counts: { category: string; count: number }[];
  missing: string[];
};

export function CoverageTable({
  phase,
  report,
}: {
  phase: "loading" | "error" | "ready";
  report: CoverageReport | null;
}) {
  if (phase === "loading") return <Status tone="loading" title="Loading coverage" />;
  if (phase === "error" || !report) return <Status tone="error" title="Could not load coverage" />;
  if (report.memberCount === 0 && report.target === null) {
    return <Status tone="empty" title="No members" detail="This published snapshot has no members." />;
  }
  return (
    <div className="grid gap-3">
      <p className="text-sm">Member count {report.memberCount}.</p>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="p-3 text-left font-medium">Category counts</caption>
          <thead>
            <tr className="border-b border-line">
              <th className="p-3 font-medium" scope="col">Category</th>
              <th className="p-3 font-medium" scope="col">Members</th>
            </tr>
          </thead>
          <tbody>
            {report.counts.map((row) => (
              <tr key={row.category || "none"} className="border-b border-line last:border-0">
                <td className="p-3">
                  <button type="button" className="text-left">
                    {row.category || "No category"}
                  </button>
                </td>
                <td className="p-3">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {report.target ? (
        <p>{report.missing.length > 0 ? `Missing: ${report.missing.join(", ")}` : "No target category is missing."}</p>
      ) : (
        <p>No coverage target is set.</p>
      )}
    </div>
  );
}
