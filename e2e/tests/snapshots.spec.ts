import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("SNP-1 publishes a draft and COV-1 lists only the missing target category", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(`snap-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await page.getByRole("button", { name: "Load labeled fixture alpha" }).click();
  await expect(page.getByRole("status", { name: "Analytics loaded" })).toBeVisible();

  await page.getByRole("link", { name: "Records", exact: true }).click();
  for (const title of ["Fixture alpha open early", "Fixture alpha open later", "Fixture alpha closed"]) {
    await page.getByRole("checkbox", { name: `Select ${title}` }).click();
  }
  await page.getByLabel("Collection").fill("Release");
  await page.getByRole("button", { name: "Include in collection" }).click();
  await expect(page.getByRole("status", { name: "Membership updated" })).toBeVisible();

  await page.getByRole("link", { name: "Snapshots", exact: true }).click();
  await page.getByRole("button", { name: "Release" }).click();
  await expect(page.getByRole("heading", { name: "Draft" })).toBeVisible();
  await expect(page.getByText("Fixture alpha open early")).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "snapshot-draft-desktop.png"), fullPage: true });

  await page.getByLabel("Publish name").fill("Monday list");
  await page.getByLabel("Coverage target").fill("alpha, beta, gamma");
  await page.getByRole("button", { name: "Publish snapshot" }).click();
  await expect(page.getByRole("status", { name: "Snapshot published" })).toBeVisible();
  await expect(page.getByText("Immutable")).toBeVisible();
  await expect(page.getByText("Missing: gamma")).toBeVisible();
  await expect(page.getByRole("table", { name: "Category counts" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "snapshot-published-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.getByRole("table", { name: "Category counts" })).toBeVisible();
  await expect(page.getByRole("button", { name: "gamma" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "snapshot-published-narrow.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
