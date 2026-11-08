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
  await page.getByLabel("Color theme").selectOption("light");
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

  await page.getByLabel("Color theme").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
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
  await page.getByLabel("Color theme").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "Records", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "theme-light-table-narrow.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
