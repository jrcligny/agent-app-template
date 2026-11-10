import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { DiffTable } from "@/components/comparison/diff-table";

it("DIFF-2 omits provenance that neither side has and keeps focus on a narrow table", () => {
  cleanup();
  window.innerWidth = 320;
  const { rerender } = render(<DiffTable phase="loading" rows={[]} provenance={[]} />);
  expect(screen.getByRole("status", { name: "Loading comparison" })).toBeTruthy();
  rerender(<DiffTable phase="error" rows={[]} provenance={[]} />);
  expect(screen.getByRole("alert", { name: "Could not compare" })).toBeTruthy();
  rerender(
    <DiffTable
      phase="ready"
      rows={[{ id: "b", kind: "changed", fields: ["title"], leftTitle: "Beta title", rightTitle: "Beta renamed" }]}
      provenance={[{ field: "codeVersion", left: null, right: "2026.11.10" }]}
    />,
  );
  expect(screen.queryByRole("columnheader", { name: "environmentName" })).toBeNull();
  expect(screen.queryByText("configDigest")).toBeNull();
  expect(screen.getByRole("button", { name: "codeVersion" })).toBeTruthy();
  expect(screen.getByText("2026.11.10")).toBeTruthy();
  expect(screen.queryByText("unknown")).toBeNull();
  const row = screen.getByRole("button", { name: /Changed title/ });
  row.focus();
  fireEvent.keyDown(row, { key: "Enter" });
  expect(document.activeElement).toBe(row);
  expect(screen.getByRole("table", { name: "Differences" })).toBeTruthy();
});
