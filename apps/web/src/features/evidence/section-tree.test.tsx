import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { SectionTree, type SectionNode } from "@/components/evidence/section-tree";

const sections: SectionNode[] = [
  {
    id: "context",
    title: "Context",
    text: "<img src=x onerror=alert(1)>",
    link: "/records",
    children: [{ id: "field", title: "Nested field", text: "Visible value", children: [] }],
  },
];

it("SEC-1 expands a nested section from the keyboard", () => {
  cleanup();
  window.innerWidth = 320;
  const { rerender } = render(<SectionTree phase="loading" sections={[]} />);
  expect(screen.getByRole("status", { name: "Loading sections" })).toBeTruthy();

  rerender(<SectionTree phase="error" sections={[]} />);
  expect(screen.getByRole("alert", { name: "Could not load sections" })).toBeTruthy();

  rerender(<SectionTree phase="empty" sections={[]} />);
  expect(screen.getByRole("status", { name: "No sections" })).toBeTruthy();

  rerender(<SectionTree phase="ready" sections={sections} />);
  const node = screen.getByRole("button", { name: "Context" });
  expect(screen.queryByText("Visible value")).toBeNull();
  node.focus();
  fireEvent.keyDown(node, { key: "Enter" });
  expect(document.activeElement).toBe(node);
  const nested = screen.getByRole("button", { name: "Nested field" });
  nested.focus();
  fireEvent.keyDown(nested, { key: "Enter" });
  expect(document.activeElement).toBe(nested);
  expect(screen.getByText("Visible value")).toBeTruthy();
  expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeTruthy();
  expect(screen.queryByRole("img")).toBeNull();
  expect(screen.getByRole("button", { name: "Context" })).toBeTruthy();
});
