import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AuthPanel } from "./auth-panel";

it("HELLO-2 keeps focus on an empty password", () => {
  cleanup();
  vi.stubGlobal("fetch", () => Promise.reject(new Error("should not send")));
  render(<AuthPanel />);
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
  const password = screen.getByLabelText("Password");
  fireEvent.change(password, { target: { value: "" } });
  fireEvent.submit(password.closest("form") as HTMLFormElement);
  expect(document.activeElement).toBe(password);
  expect(screen.getByRole("alert", { name: "Enter a password." })).toBeTruthy();
  vi.unstubAllGlobals();
});
