import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DataTable, type DataTableRow } from "./data-table";

const rows: DataTableRow[] = [
  { id: "1", title: "Alpha", status: "open", ownerName: "Ada" },
  { id: "2", title: "Beta", status: "closed", ownerName: "Ada" },
];

const meta = { title: "Data/DataTable", component: StoryTable } satisfies Meta<typeof StoryTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithRows: Story = {};
export const Empty: Story = { args: { rows: [] } };

function StoryTable({ rows: initial = rows }: { rows?: DataTableRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <DataTable
      rows={initial}
      selectedIds={selected}
      onToggle={(id) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))}
      query=""
      onQueryChange={() => undefined}
      status=""
      onStatusChange={() => undefined}
      sort="title"
      onSortChange={() => undefined}
      page={1}
      pageCount={1}
      onPageChange={() => undefined}
      onOpen={() => undefined}
      onBulkDelete={() => undefined}
      emptyTitle="No records match"
      emptyDetail="Try a different search."
    />
  );
}
