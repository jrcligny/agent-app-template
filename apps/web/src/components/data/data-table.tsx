import { Status } from "@/components/feedback/status";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";

export type DataTableRow = {
  id: string;
  title: string;
  status: string;
  ownerName: string;
};

export function DataTable({
  rows,
  selectedIds,
  onToggle,
  query,
  onQueryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  page,
  pageCount,
  onPageChange,
  onOpen,
  onBulkDelete,
  canDelete = true,
  emptyTitle,
  emptyDetail,
}: {
  rows: DataTableRow[];
  selectedIds: readonly string[];
  onToggle: (id: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  status: "" | "open" | "closed";
  onStatusChange: (value: "" | "open" | "closed") => void;
  sort: "title" | "-title";
  onSortChange: (value: "title" | "-title") => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onOpen: (id: string) => void;
  onBulkDelete: () => void;
  canDelete?: boolean;
  emptyTitle: string;
  emptyDetail: string;
}) {
  const selectedCount = selectedIds.length;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-48 flex-1 gap-1.5">
          <label htmlFor="record-search" className="text-sm font-medium">
            Search records
          </label>
          <input
            id="record-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <SelectField
          id="record-filter-status"
          label="Status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as "" | "open" | "closed")}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </SelectField>
        <SelectField
          id="record-sort"
          label="Sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as "title" | "-title")}
        >
          <option value="title">Title A to Z</option>
          <option value="-title">Title Z to A</option>
        </SelectField>
      </div>
      {canDelete ? (
        <ActionRow label="Table actions">
          <Button variant="danger" disabled={selectedCount === 0} onClick={onBulkDelete}>
            Delete {selectedCount} records
          </Button>
        </ActionRow>
      ) : null}
      {rows.length === 0 ? <Status tone="empty" title={emptyTitle} detail={emptyDetail} /> : null}
      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Records you can read</caption>
            <thead>
              <tr className="border-b border-line">
                <th className="p-3 font-medium" scope="col">
                  Select
                </th>
                <th className="p-3 font-medium" scope="col">
                  Title
                </th>
                <th className="p-3 font-medium" scope="col">
                  Status
                </th>
                <th className="p-3 font-medium" scope="col">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const selected = selectedIds.includes(row.id);
                return (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <td className="p-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        aria-label={`Select ${row.title}`}
                        className="rounded border border-line px-2 py-1"
                        onClick={() => onToggle(row.id)}
                        onKeyDown={(event) => {
                          if (event.key === " ") {
                            event.preventDefault();
                            onToggle(row.id);
                          }
                        }}
                      >
                        {selected ? "Selected" : "Not selected"}
                      </button>
                    </td>
                    <td className="p-3">
                      <button type="button" className="font-medium underline" onClick={() => onOpen(row.id)}>
                        {row.title}
                      </button>
                    </td>
                    <td className="p-3">{row.status}</td>
                    <td className="p-3">{row.ownerName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="quiet" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous page
        </Button>
        <p className="text-sm text-muted">
          Page {page} of {pageCount}
        </p>
        <Button variant="quiet" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Next page
        </Button>
      </div>
    </div>
  );
}
