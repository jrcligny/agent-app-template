import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createMemoryRouter, Link, Outlet, RouterProvider } from "react-router";
import { RecordFormPage } from "./record-form-page";

afterEach(() => {
  cleanup();
});

it("FRM-1 focuses the reason field when a closed record has no reason", () => {
  renderForm();
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Closed item" } });
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "closed" } });
  fireEvent.click(screen.getByRole("button", { name: "Save record" }));
  expect(screen.getByText("Enter a reason for closing the record.")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByLabelText("Reason"));
});

it("FRM-2 asks before leaving unsaved edits", () => {
  renderForm();
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Draft" } });
  fireEvent.click(screen.getByRole("link", { name: "Records" }));
  expect(screen.getByRole("dialog", { name: "Leave without saving?" })).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Record list" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Leave page" }));
  expect(screen.getByRole("heading", { name: "Record list" })).toBeTruthy();
});

function renderForm() {
  const router = createMemoryRouter(
    [
      {
        element: (
          <>
            <Link to="/records">Records</Link>
            <Outlet />
          </>
        ),
        children: [
          { path: "/records/new", element: <RecordFormPage mode="create" /> },
          { path: "/records", element: <h1>Record list</h1> },
        ],
      },
    ],
    { initialEntries: ["/records/new"] },
  );
  render(<RouterProvider router={router} />);
}
