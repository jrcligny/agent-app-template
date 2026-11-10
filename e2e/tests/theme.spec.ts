import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("theme choice persists and charts stay labeled in light and dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(`theme-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("link", { name: "Collections", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Notes" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Wizard" })).toHaveCount(0);
  await page.screenshot({ path: path.join(artifacts, "nav-light-desktop.png") });
  const themeButton = page.getByRole("button", { name: /Color theme/ });
  await themeButton.click();
  await expect(page.getByRole("menu", { name: "Color theme" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "theme-menu-light-desktop.png") });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("menuitemradio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.screenshot({ path: path.join(artifacts, "theme-light-dashboard-desktop.png"), fullPage: true });

  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await page.getByRole("button", { name: "Load labeled fixture alpha" }).click();
  await expect(page.getByRole("status", { name: "Analytics loaded" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Daily count/ })).toBeVisible();
  await expect(page.getByText(/observations/).first()).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "theme-light-chart-desktop.png"), fullPage: true });

  await page.getByRole("link", { name: "Records", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "theme-light-table-desktop.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: /Color theme/ }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /Color theme/ }).click();
  await expect(page.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
  await page.screenshot({ path: path.join(artifacts, "theme-menu-dark-desktop.png") });
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(artifacts, "theme-dark-table-desktop.png"), fullPage: true });
  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await page.getByRole("button", { name: "Apply window" }).click();
  await expect(page.getByRole("heading", { name: /Daily count/ })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "theme-dark-chart-desktop.png"), fullPage: true });
  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await page.screenshot({ path: path.join(artifacts, "theme-dark-dashboard-desktop.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.setViewportSize({ width: 375, height: 900 });
  await page.screenshot({ path: path.join(artifacts, "theme-dark-dashboard-narrow.png"), fullPage: true });
  await page.screenshot({ path: path.join(artifacts, "nav-dark-narrow.png") });
  await page.getByRole("button", { name: /Color theme/ }).click();
  await page.screenshot({ path: path.join(artifacts, "theme-menu-dark-narrow.png") });
  await page.getByRole("menuitemradio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.screenshot({ path: path.join(artifacts, "nav-light-narrow.png") });
  await page.getByRole("link", { name: "Records", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "theme-light-table-narrow.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
