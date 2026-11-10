import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("NAV-1 opens a snapshot item and keeps the status filter", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(`path-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("link", { name: "Records", exact: true }).click();
  for (const title of ["Alpha title", "Beta title"]) {
    await page.getByRole("link", { name: "Full form" }).click();
    await page.getByRole("textbox", { name: "Title", exact: true }).fill(title);
    await page.getByRole("button", { name: "Save record" }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await page.getByRole("link", { name: "Back to records" }).click();
  }
  await page.getByRole("checkbox", { name: "Select Alpha title" }).click();
  await page.getByRole("checkbox", { name: "Select Beta title" }).click();
  await page.getByLabel("Collection").fill("Release");
  await page.getByRole("button", { name: "Include in collection" }).click();
  await expect(page.getByRole("status", { name: "Membership updated" })).toBeVisible();

  await page.getByRole("link", { name: "Collections", exact: true }).click();
  await page.getByRole("button", { name: "Release" }).click();
  await page.getByLabel("Publish name").fill("Baseline");
  await page.getByRole("button", { name: "Publish snapshot" }).click();
  await expect(page.getByRole("status", { name: "Snapshot published" })).toBeVisible();
  await page.getByRole("link", { name: "Open Baseline" }).click();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Release");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Baseline");
  await page.getByLabel("Status").selectOption("open");
  await expect(page).toHaveURL(/status=open/);
  await page.getByRole("link", { name: "Alpha title" }).click();
  await expect(page.getByRole("status", { name: "No attempts" })).toBeVisible();
  await page.getByLabel("Attempt label").fill("First check");
  await page.getByRole("button", { name: "Save attempt" }).click();
  await expect(page.getByRole("heading", { name: "First check" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Alpha title");
  await expect(page).toHaveURL(/status=open/);
  await page.screenshot({ path: path.join(artifacts, "hierarchy-light-desktop.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: /Color theme/ }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: path.join(artifacts, "hierarchy-dark-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Attempts" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "hierarchy-dark-narrow.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "Back" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/status=open/);
  await expect(page).not.toHaveURL(/attempt=/);
  await expect(page.getByRole("heading", { name: "Alpha title" })).toBeVisible();
});
