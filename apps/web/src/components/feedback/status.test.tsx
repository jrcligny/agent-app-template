import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Status } from "./status";

describe("shared status", () => {
  it("NOTES-4 shows loading, empty, error, and success states", () => {
    const { rerender } = render(<Status tone="loading" title="Loading notes" />);
    expect(screen.getByRole("status", { name: "Loading notes" })).toBeTruthy();

    rerender(<Status tone="empty" title="No notes yet" detail="Notes you add stay on your account." />);
    expect(screen.getByRole("status", { name: "No notes yet" })).toBeTruthy();

    rerender(<Status tone="error" title="Could not load notes" />);
    expect(screen.getByRole("alert", { name: "Could not load notes" })).toBeTruthy();

    rerender(<Status tone="success" title="Note added" />);
    expect(screen.getByRole("status", { name: "Note added" })).toBeTruthy();
  });
});
