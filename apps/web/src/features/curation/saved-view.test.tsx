import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter, useSearchParams } from "react-router";
import { CurationPanel } from "@/components/curation/curation-panel";
import { DataTable } from "@/components/data/data-table";

it("VIEW-1 restores status and tag from the URL", () => {
  window.innerWidth = 320;
  render(
    <MemoryRouter initialEntries={["/records?status=open&tag=priority"]}>
      <Harness />
    </MemoryRouter>,
  );
  expect(screen.getByText("Filters: status open, tag priority, collection any.")).toBeTruthy();
  expect((screen.getByLabelText("Tag") as HTMLInputElement).value).toBe("priority");
  expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toBe("open");
  expect(screen.getByRole("status", { name: "No records match" })).toBeTruthy();
  expect(screen.getByRole("searchbox", { name: "Search records" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Include in collection" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Save view" }));
  expect(screen.getByText("Enter a view name.")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByLabelText("View name"));
});

function Harness() {
  const [params] = useSearchParams();
  const status = params.get("status");
  return (
    <>
      <CurationPanel />
      <DataTable
        rows={[]}
        selectedIds={[]}
        onToggle={() => undefined}
        query={params.get("q") ?? ""}
        onQueryChange={() => undefined}
        status={status === "open" || status === "closed" ? status : ""}
        onStatusChange={() => undefined}
        sort="title"
        onSortChange={() => undefined}
        page={1}
        pageCount={1}
        onPageChange={() => undefined}
        onOpen={() => undefined}
        onBulkDelete={() => undefined}
        emptyTitle="No records match"
        emptyDetail="Try a different search. The search field stays available."
      />
    </>
  );
}
