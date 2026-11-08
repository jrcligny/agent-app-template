import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { DashboardPage } from "./dashboard-page";

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

it("WB-1 distinguishes all records, open records, zero, and unknown", async () => {
  vi.stubGlobal("fetch", () => new Promise(() => undefined));
  const loading = render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
  expect(screen.getByRole("status", { name: "Loading dashboard" })).toBeTruthy();
  expect(screen.queryByText("0")).toBeNull();
  loading.unmount();

  vi.stubGlobal("fetch", () => json({ all: 4, open: 1 }));
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
  const all = await screen.findByRole("link", { name: /All records you can read/ });
  expect(all.textContent).toContain("4");
  expect(all.getAttribute("href")).toBe("/records");
  const open = screen.getByRole("link", { name: /Open records among the records you can read/ });
  expect(open.textContent).toContain("1");
  expect(open.getAttribute("href")).toBe("/records?status=open");
  cleanup();

  vi.stubGlobal("fetch", () => json({ all: 2, open: 0 }));
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
  expect(await screen.findByRole("status", { name: "No open records" })).toBeTruthy();
  expect(screen.getByText("Zero means no open records.")).toBeTruthy();
  expect(screen.getByRole("link", { name: /Open records among the records you can read/ }).textContent).toContain("0");
  cleanup();

  vi.stubGlobal("fetch", () => json({ error: { code: "internal", message: "nope" } }, 500));
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
  expect(await screen.findByRole("alert", { name: "Could not load the dashboard" })).toBeTruthy();
  expect(screen.queryByText("0")).toBeNull();
  expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
});

it("WB-2 shows a forbidden status instead of a zero count", async () => {
  vi.stubGlobal(
    "fetch",
    () => json({ error: { code: "forbidden", message: "You do not have permission to view records" } }, 403),
  );
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
  expect(await screen.findByRole("alert", { name: "You do not have permission to view records" })).toBeTruthy();
  expect(screen.queryByText("0")).toBeNull();
  expect(screen.queryByRole("link", { name: /All records you can read/ })).toBeNull();
});

function json(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}
