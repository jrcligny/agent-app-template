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
  await expect(page.locator("header")).not.toContainText(/API ok|Checking API|API unavailable/);
  await page.screenshot({ path: path.join(artifacts, "header-desktop.png") });

  await page.getByRole("link", { name: "Activity", exact: true }).click();
  await expect(page.getByRole("status", { name: "No activity yet" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "activity-empty.png") });

  await page.getByRole("link", { name: "Records", exact: true }).click();
  await page.getByRole("link", { name: "New record" }).click();
  await page.getByRole("textbox", { name: "Title", exact: true }).fill("Wizard record");
  const firstProgress = page.getByRole("progressbar");
  await expect(firstProgress).toHaveAttribute("aria-valuenow", "1");
  await expect(firstProgress).toHaveAttribute("aria-valuetext", "Step 1 of 3. Current step: Record title.");
  await expect(page.getByText("Step 1 of 3. Current step: Record title.")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("open");
  await assertWizardActions(page, "2", "Record status");
  await page.screenshot({ path: path.join(artifacts, "wizard-progress-desktop.png") });
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "wizard-review.png") });
  await page.getByRole("button", { name: "Finish" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status", { name: "Record created" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("link", { name: "Records", exact: true }).click();
  await page.getByRole("link", { name: "Export" }).click();
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
  await expect(page.locator("header")).not.toContainText(/API ok|Checking API|API unavailable/);
  await page.screenshot({ path: path.join(artifacts, "header-narrow.png") });
  await page.getByRole("link", { name: "Records", exact: true }).click();
  await page.getByRole("link", { name: "New record" }).click();
  await page.getByRole("textbox", { name: "Title", exact: true }).fill("Narrow wizard");
  await page.getByRole("button", { name: "Next" }).click();
  await assertWizardActions(page, "2", "Record status");
  await page.screenshot({ path: path.join(artifacts, "wizard-progress-narrow.png"), fullPage: true });
  await page.getByRole("button", { name: "Back" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save settings" })).toBeVisible();
  await page.getByLabel("Display name").fill("Ada Lovelace");
  await page.getByLabel("Page size").selectOption("10");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status", { name: "Settings saved" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "settings-narrow.png") });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

async function assertWizardActions(
  page: import("@playwright/test").Page,
  step: string,
  title: string,
) {
  const progress = page.getByRole("progressbar");
  await expect(progress).toHaveAttribute("aria-valuenow", step);
  await expect(progress).toHaveAttribute("aria-valuetext", `Step ${step} of 3. Current step: ${title}.`);
  const footer = page.getByRole("group", { name: "Wizard actions" });
  const back = page.getByRole("button", { name: "Back" });
  const next = page.getByRole("button", { name: "Next" });
  const footerBox = await footer.boundingBox();
  const backBox = await back.boundingBox();
  const nextBox = await next.boundingBox();
  if (!footerBox || !backBox || !nextBox) throw new Error("Wizard actions were not visible");
  expect(nextBox.width).toBeLessThan(footerBox.width * 0.75);
  expect(backBox.width).toBeLessThan(footerBox.width * 0.75);
  expect(nextBox.height).toBeGreaterThanOrEqual(44);
  expect(backBox.height).toBeGreaterThanOrEqual(44);
  expect(nextBox.x + nextBox.width).toBeLessThanOrEqual(footerBox.x + footerBox.width + 1);
  expect(nextBox.x + nextBox.width).toBeGreaterThan(footerBox.x + footerBox.width - 32);
  if (backBox.y === nextBox.y) {
    expect(backBox.x + backBox.width).toBeLessThanOrEqual(nextBox.x + 1);
  }
}
