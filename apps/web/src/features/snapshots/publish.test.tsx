import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { SnapshotsPage } from "./snapshots-page";

const collectionId = "11111111-1111-4111-8111-111111111111";
const snapshotId = "22222222-2222-4222-8222-222222222222";

it("SNP-2 focuses the name field when publish name is empty", async () => {
  cleanup();
  vi.stubGlobal("fetch", () => new Promise(() => undefined));
  const loading = render(
    <MemoryRouter>
      <SnapshotsPage />
    </MemoryRouter>,
  );
  expect(screen.getByRole("status", { name: "Loading drafts" })).toBeTruthy();
  loading.unmount();

  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/api/collections") && (!init || !init.method || init.method === "GET")) {
      return json({ collections: [{ id: collectionId, name: "Release", memberCount: 2 }] });
    }
    if (url.includes("/api/snapshots?")) return json({ snapshots: [] });
    if (url.endsWith("/draft")) {
      return json({
        id: collectionId,
        name: "Release",
        members: [
          { id: "33333333-3333-4333-8333-333333333333", title: "Alpha title", status: "open", category: "alpha" },
          { id: "44444444-4444-4444-8444-444444444444", title: "Gamma title", status: "open", category: "gamma" },
        ],
      });
    }
    if (url.endsWith("/api/snapshots") && init?.method === "POST") {
      return json({
        id: snapshotId,
        collectionId,
        name: "Monday",
        revision: 1,
        createdAt: "2026-01-02T00:00:00.000Z",
        environmentName: null,
        configDigest: null,
        codeVersion: null,
        members: [
          { recordId: "33333333-3333-4333-8333-333333333333", title: "Alpha title", status: "open", category: "alpha", sourceUpdatedAt: "2026-01-02T00:00:00.000Z" },
          { recordId: "44444444-4444-4444-8444-444444444444", title: "Gamma title", status: "open", category: "gamma", sourceUpdatedAt: "2026-01-02T00:00:00.000Z" },
        ],
      });
    }
    if (url.endsWith("/coverage")) {
      return json({
        memberCount: 2,
        target: ["alpha", "beta", "gamma"],
        counts: [
          { category: "alpha", count: 1 },
          { category: "beta", count: 0 },
          { category: "gamma", count: 1 },
        ],
        missing: ["beta"],
      });
    }
    return json({ error: { code: "internal", message: "nope" } }, 500);
  });

  render(
    <MemoryRouter>
      <SnapshotsPage />
    </MemoryRouter>,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Release" }));
  await screen.findByRole("heading", { name: "Draft" });
  expect(document.body.textContent).toContain("Alpha title");
  fireEvent.click(screen.getByRole("button", { name: "Publish snapshot" }));
  expect(screen.getByText("Enter a publish name.")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByLabelText("Publish name"));

  fireEvent.change(screen.getByLabelText("Publish name"), { target: { value: "Monday" } });
  fireEvent.change(screen.getByLabelText("Coverage target"), { target: { value: "alpha, beta, gamma" } });
  screen.getByLabelText("Publish name").focus();
  fireEvent.keyDown(screen.getByLabelText("Publish name"), { key: "Enter" });
  expect(await screen.findByRole("status", { name: "Snapshot published" })).toBeTruthy();
  expect(screen.getByText("Immutable")).toBeTruthy();
  expect(screen.getByText("Missing: beta")).toBeTruthy();
  expect(screen.getByRole("table", { name: "Category counts" })).toBeTruthy();
  expect(screen.queryByText(/quality/i)).toBeNull();
  window.innerWidth = 320;
  expect(screen.getByRole("button", { name: "beta" })).toBeTruthy();
  cleanup();
  vi.unstubAllGlobals();
});

function json(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
}
