import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { Status } from "@/components/feedback/status";
import { RecordDrawer } from "./record-drawer";

const record = {
  id: "10000000-0000-4000-8000-000000000001",
  title: "Alpha",
  status: "open" as const,
  ownerName: "Ada",
  summary: "Short summary",
  body: "Long body",
  reason: null,
  createdAt: "2026-11-08T00:00:00.000Z",
  updatedAt: "2026-11-08T00:00:00.000Z",
};

it("DET-1 moves focus into the drawer and opens the full route", () => {
  const { rerender } = render(
    <MemoryRouter>
      <Harness phase="ready" />
    </MemoryRouter>,
  );
  const opener = screen.getByRole("button", { name: "Open Alpha" });
  opener.focus();
  fireEvent.click(opener);
  expect(screen.getByText("Short summary")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Open full record" }).getAttribute("href")).toBe(`/records/${record.id}`);
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close summary" }));
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByText("Short summary")).toBeNull();
  expect(document.activeElement).toBe(opener);

  rerender(
    <MemoryRouter>
      <RecordDrawer open phase="loading" record={null} onClose={() => undefined} />
    </MemoryRouter>,
  );
  expect(screen.getByRole("status", { name: "Loading record" })).toBeTruthy();
  rerender(
    <MemoryRouter>
      <RecordDrawer open phase="error" record={null} onClose={() => undefined} />
    </MemoryRouter>,
  );
  expect(screen.getByRole("alert", { name: "Could not load the record" })).toBeTruthy();
});

function Harness({ phase }: { phase: "ready" | "loading" | "error" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Alpha
      </button>
      <RecordDrawer open={open} phase={phase} record={phase === "ready" ? record : null} onClose={() => setOpen(false)} />
      {phase === "loading" ? <Status tone="loading" title="unused" /> : null}
    </>
  );
}
