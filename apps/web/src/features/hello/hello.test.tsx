import { cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { HelloPage } from "./hello-page";

it("HELLO-1 shows Hello world and no business navigation", () => {
  cleanup();
  render(<HelloPage />);
  expect(screen.getByRole("heading", { name: "Hello world" })).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Records" })).toBeNull();
  expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
});
