import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("WB-1 creates a record, confirms delete, and stays usable when narrow", async ({ page }) => {
  const email = `workbench-${Date.now()}@example.com`;
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: /All records you can read/ })).toContainText("0");
  await expect(page.getByRole("status", { name: "No open records" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "dashboard-zero.png") });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("link", { name: "Records", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Records" })).toBeVisible();
  await page.getByRole("link", { name: "New record" }).click();
  await expect(page.getByRole("heading", { name: "New record" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "record-form.png") });

  await page.getByLabel("Title").fill("Quarterly summary");
  await page.getByLabel("Summary").fill("Short summary");
  await page.getByLabel("Body").fill("The long body stays on the record page.");
  await page.getByRole("button", { name: "Save record" }).click();
  await expect(page.getByRole("heading", { name: "Quarterly summary" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Record saved" })).toBeVisible();
  await expect(page.getByText("The long body stays on the record page.")).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "record-detail.png") });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("link", { name: "Back to records" }).click();
  await expect(page.getByRole("button", { name: "Quarterly summary" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "record-table.png") });

  await page.getByRole("button", { name: "Quarterly summary" }).click();
  await expect(page.getByText("Short summary")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close summary" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Short summary")).toHaveCount(0);

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole("searchbox", { name: "Search records" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete 0 records" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "record-table-narrow.png") });

  await page.getByRole("checkbox", { name: "Select Quarterly summary" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Delete 1 records" })).toBeEnabled();
  await page.getByRole("button", { name: "Delete 1 records" }).click();
  await expect(page.getByRole("dialog", { name: "Delete 1 record?" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Quarterly summary" })).toBeVisible();

  await page.getByRole("button", { name: "Delete 1 records" }).click();
  await page.getByRole("button", { name: "Delete 1 record", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status", { name: "Record deleted" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Quarterly summary" })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
