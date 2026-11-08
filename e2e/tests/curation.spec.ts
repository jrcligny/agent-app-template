import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("VIEW-1 keeps filters in the URL and a narrow collection action stays visible", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(`curation-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("link", { name: "Records", exact: true }).click();
  await page.getByRole("link", { name: "New record" }).click();
  await page.getByLabel("Title").fill("Curated record");
  await page.getByRole("button", { name: "Save record" }).click();
  await expect(page.getByRole("heading", { name: "Curated record" })).toBeVisible();
  await page.getByRole("link", { name: "Back to records" }).click();

  await page.getByLabel("Tag to apply").fill("priority");
  await page.getByRole("checkbox", { name: "Select Curated record" }).click();
  await page.getByRole("button", { name: "Apply tag" }).click();
  await expect(page.getByRole("status", { name: "Tag applied" })).toBeVisible();
  await expect(page).toHaveURL(/tag=priority/);
  await page.getByLabel("Status").selectOption("open");
  await expect(page).toHaveURL(/status=open/);
  await page.getByLabel("View name").fill("Open priority");
  await page.getByRole("button", { name: "Save view" }).click();
  await expect(page.getByRole("status", { name: "View saved" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "saved-view.png") });

  await page.getByRole("checkbox", { name: "Select Curated record" }).click();
  await page.getByLabel("Collection").fill("Inbox");
  await page.getByRole("button", { name: "Include in collection" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status", { name: "Membership updated" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Curated record" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "collection-membership.png") });

  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.getByText(/Filters: status open, tag priority/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Include in collection" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "curation-narrow.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
