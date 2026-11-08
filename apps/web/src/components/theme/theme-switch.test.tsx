import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ThemeSwitch } from "./theme-switch";

it("stores the chosen theme and follows the system again", () => {
  cleanup();
  const listeners: Array<() => void> = [];
  let dark = false;
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return dark;
    },
    addEventListener: (_event: string, listener: () => void) => {
      listeners.push(listener);
    },
    removeEventListener: () => undefined,
  }));
  localStorage.clear();
  render(<ThemeSwitch />);
  expect(document.documentElement.dataset.theme).toBe("light");
  fireEvent.change(screen.getByLabelText("Color theme"), { target: { value: "dark" } });
  expect(localStorage.getItem("workbench-theme")).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
  fireEvent.change(screen.getByLabelText("Color theme"), { target: { value: "system" } });
  dark = true;
  for (const listener of listeners) listener();
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("workbench-theme")).toBe("system");
  vi.unstubAllGlobals();
  cleanup();
});
