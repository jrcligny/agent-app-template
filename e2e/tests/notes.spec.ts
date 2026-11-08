import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const artifacts = process.env.ARTIFACTS_DIR ?? path.resolve(import.meta.dirname, "../screenshots");
mkdirSync(artifacts, { recursive: true });

test("NOTES-4 shows an empty list then the saved note", async ({ page }) => {
  const email = `person-${Date.now()}@example.com`;
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "sign-up.png") });
  const signedOutAxe = await new AxeBuilder({ page }).analyze();
  expect(signedOutAxe.violations).toEqual([]);

  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").focus();
  await page.keyboard.type(email);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Notes" }).click();
  await expect(page.getByRole("heading", { name: "Your notes" })).toBeVisible();
  await expect(page.getByRole("status", { name: "No notes yet" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "notes-empty.png") });

  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Enter a title.")).toBeVisible();
  await expect(page.getByLabel("Title")).toBeFocused();

  await page.getByLabel("Title").fill("Milk");
  await page.getByLabel("Body").fill("Oat");
  await page.getByLabel("Title").press("Enter");
  await expect(page.getByRole("heading", { name: "Milk" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Note added" })).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "notes-saved.png") });
  const notesAxe = await new AxeBuilder({ page }).analyze();
  expect(notesAxe.violations).toEqual([]);

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole("heading", { name: "Your notes" })).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await page.screenshot({ path: path.join(artifacts, "notes-narrow.png") });

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
});

test("NOTES-2 hides another account's note on the screen", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  await signUp(pageA, `a-${Date.now()}@example.com`);
  await pageA.getByLabel("Title").fill("Private");
  await pageA.getByLabel("Body").fill("Only A");
  await pageA.getByRole("button", { name: "Add note" }).click();
  await expect(pageA.getByRole("heading", { name: "Private" })).toBeVisible();

  await signUp(pageB, `b-${Date.now()}@example.com`);
  await expect(pageB.getByRole("status", { name: "No notes yet" })).toBeVisible();
  await expect(pageB.getByRole("heading", { name: "Private" })).toHaveCount(0);
  await contextA.close();
  await contextB.close();
});

async function signUp(page: Page, email: string) {
  await page.goto("/");
  await page.getByLabel("Name").fill("Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Notes" }).click();
  await expect(page.getByRole("heading", { name: "Your notes" })).toBeVisible();
}
