import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it } from "vitest";
import { DataTable, type DataTableRow } from "@/components/data/data-table";

const rows: DataTableRow[] = [{ id: "1", title: "Alpha", status: "open", ownerName: "Ada" }];

it("TBL-2 selects a row from the keyboard and keeps search visible when narrow", () => {
  window.innerWidth = 320;
  render(<Harness />);
  const search = screen.getByRole("searchbox", { name: "Search records" });
  const bulk = screen.getByRole("button", { name: "Delete 0 records" });
  expect(search).toBeTruthy();
  expect(bulk).toBeTruthy();

  const checkbox = screen.getByRole("checkbox", { name: "Select Alpha" });
  checkbox.focus();
  fireEvent.keyDown(checkbox, { key: " " });
  expect(screen.getByRole("checkbox", { name: "Select Alpha" }).getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("button", { name: "Delete 1 records" })).toBeTruthy();
  expect(screen.getByRole("searchbox", { name: "Search records" })).toBeTruthy();
});

function Harness() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <DataTable
      rows={rows}
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
