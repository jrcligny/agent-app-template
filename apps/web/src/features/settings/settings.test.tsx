import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { SettingsPage } from "./settings-page";

it("SET-1 validates the display name and keeps save visible when narrow", async () => {
  window.innerWidth = 320;
  vi.stubGlobal(
    "fetch",
    () =>
      Promise.resolve(
        new Response(JSON.stringify({ displayName: "Ada", pageSize: 25 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
  );
  const router = createMemoryRouter([{ path: "/settings", element: <SettingsPage /> }], {
    initialEntries: ["/settings"],
  });
  render(<RouterProvider router={router} />);
  const name = await screen.findByLabelText("Display name");
  expect(screen.getByRole("button", { name: "Save settings" })).toBeTruthy();
  fireEvent.change(name, { target: { value: "   " } });
  fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
  expect(screen.getByText("Enter a display name.")).toBeTruthy();
  expect(document.activeElement).toBe(name);
  vi.unstubAllGlobals();
});
