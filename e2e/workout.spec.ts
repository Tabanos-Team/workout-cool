import { expect, test } from "@playwright/test";

import {
  cleanupLab08Data,
  createAttributedTestExercise,
  disconnectPrisma
} from "../src/test/integration/helpers/workout-session-fixtures";

test.describe("authenticated workout flow", () => {
  const runId = `e2e-workout-${crypto.randomUUID()}`;

  test.beforeAll(async () => {
    await cleanupLab08Data(runId);
    await createAttributedTestExercise(runId);
  });

  test.afterAll(async () => {
    await cleanupLab08Data(runId);
    await disconnectPrisma();
  });

  test("saves onboarding preferences and completes a workout", async ({ page }) => {
    const preferences = await page.request.put("/api/user/preferences", {
      data: {
        goals: ["strength", "consistency"],
        fitnessLevel: "beginner",
        equipment: ["BODY_ONLY"],
        muscles: ["CHEST"],
        duration: 30,
        weeklyFrequency: 3,
        notificationDays: [1, 3, 5],
        notificationTime: "07:30"
      }
    });

    expect(preferences.status()).toBe(200);
    await expect(preferences.json()).resolves.toMatchObject({ success: true });

    await page.goto("/en");
    await page.getByText("Bodyweight", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.locator("[data-elem=\"CHEST\"]").first().click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Lab 08 Bench Press").first()).toBeVisible();
    await page.getByText("Start Workout", { exact: true }).click();
    await page.getByRole("button", { name: "Watch Ad & Start" }).click();

    const values = page.locator("input[type=\"number\"]");
    await values.nth(0).fill("10");
    await values.nth(1).fill("20");
    await page.getByRole("button", { name: "Finish Set" }).first().click();

    await page.getByRole("button", { name: "Finish Session" }).click();
    await expect(page.getByText(/Congratulations, workout finished!/)).toBeVisible();

    const storedSession = await page.evaluate(() => {
      const sessions = JSON.parse(localStorage.getItem("workoutSessions") || "[]") as Array<{ status?: string }>;
      return sessions.at(-1);
    });

    expect(storedSession?.status).toBe("completed");
  });
});
