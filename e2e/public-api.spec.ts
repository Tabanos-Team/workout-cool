
import { expect, test } from "@playwright/test";

test.describe("HITO 3 E2E: public API smoke tests from browser context", () => {
  test("programs API responds successfully", async ({ request }) => {
    const response = await request.get("/api/programs");

    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });

  test("premium plans API returns the expected response shape", async ({ request }) => {
    const response = await request.get("/api/premium/plans?region=US");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body.plans)).toBe(true);
    expect(body.detectedRegion).toBe("US");
  });

  test("RevenueCat webhook health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/webhooks/revenuecat");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.status).toBe("RevenueCat webhook endpoint active");
  });
});
