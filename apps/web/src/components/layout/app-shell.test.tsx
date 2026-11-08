import { cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AppShell } from "./app-shell";

it("header does not show API status", () => {
  cleanup();
  render(
    <AppShell nav={<a href="/records">Records</a>} account={<p>ada@example.com</p>}>
      <h1>Dashboard</h1>
    </AppShell>,
  );
  expect(screen.getByText("Workbench")).toBeTruthy();
  expect(screen.getByText("ada@example.com")).toBeTruthy();
  expect(screen.queryByText("API ok")).toBeNull();
  expect(screen.queryByText("Checking API")).toBeNull();
  expect(screen.queryByText("API unavailable")).toBeNull();
});
