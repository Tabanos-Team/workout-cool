import { afterAll, describe, expect, it } from "vitest";

import { cleanupLab08Data, createRunId, disconnectPrisma } from "./helpers/workout-session-fixtures";
import { apiRequest } from "./helpers/http";

interface SignUpResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

interface BillingStatusResponse {
  error?: string;
}

interface RevenueCatHealthResponse {
  status: string;
  configured: boolean;
  environment: string;
}

describe("HITO 3 integration: auth, billing guards and webhook health", () => {
  const runId = createRunId();

  afterAll(async () => {
    await cleanupLab08Data(runId);
    await disconnectPrisma();
  });

  it("creates a user through the custom signup endpoint and rejects duplicate email", async () => {
    const body = {
      email: `${runId}-custom@integration.test`,
      password: "Password123!",
      firstName: "Custom",
      lastName: "Signup"
    };

    const signup = await apiRequest<SignUpResponse>("/api/auth/signup", {
      method: "POST",
      body
    });

    expect(signup.response.status).toBe(200);
    expect(signup.body.user.email).toBe(body.email);
    expect(signup.body.token).toBeTruthy();

    const duplicate = await apiRequest<ErrorResponse>("/api/auth/signup", {
      method: "POST",
      body
    });

    expect(duplicate.response.status).toBe(409);
    expect(duplicate.body.error).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("rejects invalid custom signup payload with HTTP 400", async () => {
    const invalid = await apiRequest<ErrorResponse>("/api/auth/signup", {
      method: "POST",
      body: {
        email: "invalid-email",
        password: "short",
        firstName: "",
        lastName: ""
      }
    });

    expect(invalid.response.status).toBe(400);
    expect(invalid.body.error).toBe("INVALID_INPUT");
    expect(invalid.body.details).toBeDefined();
  });

  it("protects billing status when the request is unauthenticated", async () => {
    const billing = await apiRequest<BillingStatusResponse>("/api/billing/status");

    expect(billing.response.status).toBe(401);
    expect(billing.body.error).toBe("Unauthorized");
  });

  it("rejects unauthenticated checkout requests with a controlled server response", async () => {
    const checkout = await apiRequest<ErrorResponse & { success: boolean }>("/api/premium/checkout", {
      method: "POST",
      body: {
        planId: "test-plan"
      }
    });

    expect(checkout.response.status).toBe(401);
    expect(checkout.body.success).toBe(false);
    expect(checkout.body.error).toBe("Unauthorized");
  });

  it("exposes the RevenueCat webhook health check endpoint", async () => {
    const health = await apiRequest<RevenueCatHealthResponse>("/api/webhooks/revenuecat");

    expect(health.response.status).toBe(200);
    expect(health.body.status).toBe("RevenueCat webhook endpoint active");
    expect(typeof health.body.configured).toBe("boolean");
    expect(["development", "production"]).toContain(health.body.environment);
  });
});
