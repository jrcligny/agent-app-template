import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("SEC-1 shows a section as text and a file on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(`evidence-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("link", { name: "Records", exact: true }).click();
  await page.getByRole("link", { name: "Full form" }).click();
  await page.getByLabel("Title").fill("Evidence record");
  await page.getByRole("button", { name: "Save record" }).click();
  await expect(page.getByRole("heading", { name: "Evidence record" })).toBeVisible();

  await page.getByLabel("Section title").fill("Context");
  await page.getByLabel("Section text").fill("Nested field");
  await page.getByRole("button", { name: "Add section" }).click();
  await expect(page.getByRole("status", { name: "Section added" })).toBeVisible();
  await page.getByRole("button", { name: "Context" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Nested field")).toBeVisible();
  await page.getByLabel("Upload file").setInputFiles({
    name: "note.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("demo log"),
  });
  await expect(page.getByRole("status", { name: "File stored" })).toBeVisible();
  await expect(page.getByText("note.txt")).toBeVisible();
  await page.getByRole("button", { name: "Context" }).click();
  await expect(page.getByText("Nested field")).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "evidence-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.getByRole("button", { name: "Context" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "evidence-narrow.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
