import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { RecordWizard } from "./record-wizard";

it("WIZ-1 stays on an invalid step and focuses the field", () => {
  cleanup();
  render(
    <MemoryRouter>
      <RecordWizard />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Closed item" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "closed" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByText("Enter a reason for closing the record.")).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Review" })).toBeNull();
  expect(document.activeElement).toBe(screen.getByLabelText("Reason"));
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("2");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toContain("Record status");
});

it("WIZ-2 shows step progress and keeps Next after Back", () => {
  cleanup();
  render(
    <MemoryRouter>
      <RecordWizard />
    </MemoryRouter>,
  );
  const progress = screen.getByRole("progressbar");
  expect(progress.getAttribute("aria-valuemin")).toBe("1");
  expect(progress.getAttribute("aria-valuemax")).toBe("3");
  expect(progress.getAttribute("aria-valuenow")).toBe("1");
  expect(progress.getAttribute("aria-valuetext")).toBe("Step 1 of 3. Current step: Record title.");
  expect(screen.getByText("Step 1 of 3. Current step: Record title.")).toBeTruthy();
  const next = screen.getByRole("button", { name: "Next" });
  expect(next.className.split(/\s+/)).toContain("w-fit");
  expect(next.className.split(/\s+/)).not.toContain("w-full");
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Open item" } });
  fireEvent.click(next);
  const back = screen.getByRole("button", { name: "Back" });
  const nextAgain = screen.getByRole("button", { name: "Next" });
  expect(back.compareDocumentPosition(nextAgain) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(back.className).not.toContain("bg-accent");
  expect(nextAgain.className).toContain("bg-accent");
  expect(screen.getByRole("group", { name: "Wizard actions" }).className).toContain("justify-end");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("2");
});
