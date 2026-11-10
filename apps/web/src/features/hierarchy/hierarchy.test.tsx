import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";
import { expect, it, vi } from "vitest";
import { HierarchyPath, type HierarchyView } from "@/components/hierarchy/hierarchy-path";
import { HierarchyPage } from "./hierarchy-page";

const collectionId = "11111111-1111-4111-8111-111111111111";
const snapshotId = "22222222-2222-4222-8222-222222222222";
const itemId = "33333333-3333-4333-8333-333333333333";
const attemptId = "44444444-4444-4444-8444-444444444444";

it("NAV-1 returns to the filtered parent from the keyboard", async () => {
  cleanup();
  window.innerWidth = 375;
  vi.stubGlobal("fetch", (input: RequestInfo | URL) => {
    const url = String(input);
    const attempt = url.includes(`attemptId=${attemptId}`)
      ? { id: attemptId, label: "First check", attemptedAt: "2026-01-15T23:30:00.000Z" }
      : null;
    return json(body(attempt));
  });
  const router = createMemoryRouter([{ path: "/collections/:collectionId", element: <HierarchyPage /> }], {
    initialEntries: [`/collections/${collectionId}?snapshot=${snapshotId}&item=${itemId}&status=open`],
  });
  render(<RouterProvider router={router} />);
  expect(await screen.findByRole("status", { name: "No attempts" })).toBeTruthy();

  cleanup();
  const opened = createMemoryRouter([{ path: "/collections/:collectionId", element: <HierarchyPage /> }], {
    initialEntries: [`/collections/${collectionId}?snapshot=${snapshotId}&item=${itemId}&attempt=${attemptId}&status=open`],
  });
  render(<RouterProvider router={opened} />);
  expect(await screen.findByRole("status", { name: "Attempt opened" })).toBeTruthy();
  const layout = document.querySelector("[data-hierarchy-layout]");
  expect(layout?.className).toContain("flex-col");
  expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
  const back = screen.getByRole("button", { name: "Back" });
  back.focus();
  fireEvent.keyDown(back, { key: "Enter" });
  expect(opened.state.location.search).toContain("status=open");
  expect(opened.state.location.search).not.toContain("attempt=");
  expect(document.activeElement).toBe(screen.getByRole("list", { name: "Attempts" }));
  vi.unstubAllGlobals();
});

it("NAV-2 does not present an item count as quality", () => {
  cleanup();
  render(
    <MemoryRouter>
    <HierarchyPath
      phase="ready"
      path={view()}
      refreshing={false}
      status="open"
      labelError={null}
      focusToken={0}
      onStatus={() => undefined}
      onBack={() => undefined}
      onSaveAttempt={async () => false}
    />
    </MemoryRouter>,
  );
  expect(screen.getByText("2 items")).toBeTruthy();
  expect(screen.queryByText(/quality/i)).toBeNull();
  expect(screen.queryByText(/coverage/i)).toBeNull();
});

function view(): HierarchyView {
  return {
    collection: { id: collectionId, name: "Release" },
    snapshots: [{ id: snapshotId, name: "Baseline", revision: 1 }],
    snapshot: { id: snapshotId, name: "Baseline", revision: 1 },
    items: [
      { id: itemId, title: "Alpha title", status: "open", category: "alpha" },
      { id: "55555555-5555-4555-8555-555555555555", title: "Beta title", status: "open", category: "" },
    ],
    item: null,
    attempt: null,
    status: "open",
  };
}

function body(attempt: { id: string; label: string; attemptedAt: string } | null) {
  return {
    collection: { id: collectionId, name: "Release" },
    snapshots: [{ id: snapshotId, name: "Baseline", revision: 1 }],
    snapshot: { id: snapshotId, name: "Baseline", revision: 1 },
    items: [{ id: itemId, title: "Alpha title", status: "open", category: "alpha" }],
    item: {
      id: itemId,
      title: "Alpha title",
      status: "open",
      category: "alpha",
      attempts: attempt ? [attempt] : [],
    },
    attempt,
    status: "open",
  };
}

function json(value: unknown) {
  return Promise.resolve(new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json" } }));
}
