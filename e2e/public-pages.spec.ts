import { expect, test } from "@playwright/test";

const publicPages = [
  { path: "/en", label: "home" },
  { path: "/en/programs", label: "programs" },
  { path: "/en/premium", label: "premium" },
  { path: "/en/tools", label: "tools" },
  { path: "/en/tools/bmi-calculator", label: "bmi calculator" },
  { path: "/en/tools/calorie-calculator", label: "calorie calculator" },
  { path: "/en/tools/heart-rate-zones", label: "heart-rate zones" }
];

test.describe("HITO 3 E2E: public pages smoke tests", () => {
  for (const pageCase of publicPages) {
    test(`renders ${pageCase.label} page`, async ({ page }) => {
      const response = await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });

      expect(response?.status(), `${pageCase.path} should not fail`).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
      await expect(page.locator("body")).not.toBeEmpty();
    });
  }

  test("redirects root path to a localized route", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/(en|fr|es|pt|ru|zh-CN)(\/)?$/);
  });
});
