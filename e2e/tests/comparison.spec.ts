import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("DIFF-1 compares two snapshots from the collection", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(`compare-${Date.now()}@example.com`);
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

  await page.getByRole("link", { name: "Records", exact: true }).click();
  await page.getByRole("button", { name: "Beta title" }).click();
  await page.getByRole("link", { name: "Open full record" }).click();
  await page.getByRole("link", { name: "Edit record" }).click();
  await page.getByRole("textbox", { name: "Title", exact: true }).fill("Beta renamed");
  await page.getByRole("button", { name: "Save record" }).click();
  await expect(page.getByRole("status", { name: "Record saved" })).toBeVisible();

  await page.getByRole("link", { name: "Collections", exact: true }).click();
  await page.getByRole("button", { name: "Release" }).click();
  await page.getByLabel("Code version").fill("2026.11.10");
  await page.getByLabel("Publish name").fill("Later");
  await page.getByRole("button", { name: "Publish snapshot" }).click();
  await expect(page.getByRole("status", { name: "Snapshot published" })).toBeVisible();
  await page.getByLabel("Baseline").selectOption({ label: "Baseline revision 1" });
  await page.getByLabel("Later snapshot").selectOption({ label: "Later revision 2" });
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByRole("button", { name: /Changed title/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "codeVersion" })).toBeVisible();
  await expect(page.getByLabel("Timezone")).toHaveValue("Europe/Paris");
  await page.screenshot({ path: path.join(artifacts, "comparison-light-desktop.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: /Color theme/ }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: path.join(artifacts, "comparison-dark-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.getByRole("table", { name: "Differences" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "comparison-dark-narrow.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
