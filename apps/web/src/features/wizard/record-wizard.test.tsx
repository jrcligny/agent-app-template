import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { RecordWizard } from "./record-wizard";

it("WIZ-1 stays on an invalid step and focuses the field", () => {
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
});
