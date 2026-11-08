import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import { ConfirmDelete } from "./confirm-delete";

it("CFM-1 does not delete when the dialog is dismissed", () => {
  const onConfirm = vi.fn();
  render(<Harness onConfirm={onConfirm} />);
  const opener = screen.getByRole("button", { name: "Delete selected" });
  opener.focus();
  fireEvent.click(opener);
  expect(screen.getByRole("dialog", { name: "Delete 1 record?" })).toBeTruthy();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onConfirm).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(opener);
});

function Harness({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete selected
      </button>
      <ConfirmDelete open={open} count={1} onConfirm={onConfirm} onDismiss={() => setOpen(false)} />
    </>
  );
}
