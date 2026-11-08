import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import type { AnalyticsReport } from "@agent-app/contracts";
import { AnalyticsChart } from "./analytics-chart";

const report: AnalyticsReport = {
  window: { from: "2026-01-15T00:00:00.000Z", to: "2026-01-16T00:00:00.000Z", timeZone: "Europe/Paris" },
  totals: { count: 3, sum: 10, openCount: 2, closedCount: 1 },
  baseline: {
    from: "2026-01-14T00:00:00.000Z",
    to: "2026-01-15T00:00:00.000Z",
    observations: 0,
    deltaCount: null,
    deltaSum: null,
  },
  countSeries: [
    { day: "2026-01-15", count: 2 },
    { day: "2026-01-16", count: 1 },
  ],
  valueSeries: [
    { day: "2026-01-15", sum: 5 },
    { day: "2026-01-16", sum: 5 },
  ],
  statusBars: [
    { status: "open", count: 2 },
    { status: "closed", count: 1 },
  ],
  categoryBars: [
    { category: "alpha", count: 2 },
    { category: "beta", count: 1 },
  ],
  synthetic: true,
  fixture: "alpha",
};

it("AN-2 drills from the keyboard and keeps the data table when narrow", () => {
  window.innerWidth = 320;
  render(<AnalyticsChart report={report} narrow />);
  const closed = screen.getByRole("link", { name: "closed status, 1 observations" });
  closed.focus();
  expect(document.activeElement).toBe(closed);
  const href = closed.getAttribute("href") ?? "";
  expect(href).toContain("status=closed");
  expect(href).toContain("from=2026-01-15T00%3A00%3A00.000Z");
  expect(href).toContain("to=2026-01-16T00%3A00%3A00.000Z");
  expect(screen.getByRole("table", { name: "Observation totals and daily counts" })).toBeTruthy();
  expect(screen.getByText(/Change from the previous window: unknown/)).toBeTruthy();
});
