import { expect, test } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

test("registers a user and stores the authenticated browser state", async ({ page }) => {
  test.setTimeout(60_000);
  const email = `playwright-${crypto.randomUUID()}@example.test`;

  await page.goto("/en/auth/signup");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1_000);
  await page.getByRole("textbox", { name: "First name", exact: true }).fill("Playwright");
  await page.getByRole("textbox", { name: "Last name", exact: true }).fill("Tester");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);

  const passwordFields = page.locator("input[type=\"password\"]");
  await passwordFields.nth(0).fill("Password123!");
  await passwordFields.nth(1).fill("Password123!");
  await expect(page.getByRole("textbox", { name: "First name", exact: true })).toHaveValue("Playwright");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/en\/profile|\/profile/, { timeout: 30_000 });

  const profile = await page.request.get("/api/user/profile");
  expect(profile.status()).toBe(200);
  await expect(profile.json()).resolves.toMatchObject({ user: { email } });

  await page.context().storageState({ path: authFile });
});
