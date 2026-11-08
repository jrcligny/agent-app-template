import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("WIZ-1 finishes the wizard and JOB-1 retries a failed export", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(`ops-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("link", { name: "Activity", exact: true }).click();
  await expect(page.getByRole("status", { name: "No activity yet" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "activity-empty.png") });

  await page.getByRole("link", { name: "Wizard", exact: true }).click();
  await page.getByRole("textbox", { name: "Title", exact: true }).fill("Wizard record");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("open");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "wizard-review.png") });
  await page.getByRole("button", { name: "Finish" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status", { name: "Record created" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("link", { name: "Jobs", exact: true }).click();
  await page.getByLabel("Simulated result").selectOption("fail");
  await page.getByRole("button", { name: "Start export" }).click();
  await expect(page.getByRole("alert", { name: "Export failed" })).toBeVisible({ timeout: 10_000 });
  await page.screenshot({ path: path.join(artifacts, "job-failed.png") });
  await page.getByRole("button", { name: "Retry export" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status", { name: "Export finished" })).toBeVisible({ timeout: 10_000 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("link", { name: "Activity", exact: true }).click();
  await expect(page.getByText('Created record "Wizard record"')).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "activity-event.png") });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save settings" })).toBeVisible();
  await page.getByLabel("Display name").fill("Ada Lovelace");
  await page.getByLabel("Page size").selectOption("10");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status", { name: "Settings saved" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "settings-narrow.png") });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
