import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("HELLO-1 signs in to Hello world and switches theme", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "hello-signin-light.png"), fullPage: true });
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill(`hello-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Hello world" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Records" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Dashboard" })).toHaveCount(0);
  await page.screenshot({ path: path.join(artifacts, "hello-light-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 375, height: 800 });
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "hello-light-narrow.png"), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: /Color theme/ }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: path.join(artifacts, "hello-dark-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 375, height: 800 });
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "hello-dark-narrow.png"), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
