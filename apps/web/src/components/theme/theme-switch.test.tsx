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
  const button = screen.getByRole("button", { name: /Color theme/ });
  expect(button.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(button);
  expect(button.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
  expect(localStorage.getItem("workbench-theme")).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(document.activeElement).toBe(button);
  fireEvent.click(button);
  fireEvent.keyDown(screen.getByRole("menu", { name: "Color theme" }), { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(button);
  fireEvent.click(button);
  fireEvent.click(screen.getByRole("menuitemradio", { name: "System" }));
  dark = true;
  for (const listener of listeners) listener();
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("workbench-theme")).toBe("system");
  vi.unstubAllGlobals();
  cleanup();
});
