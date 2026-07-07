import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupLab08Data,
  createAuthenticatedUser,
  createRunId,
  disconnectPrisma,
  type TestIdentity
} from "./helpers/workout-session-fixtures";
import { apiRequest } from "./helpers/http";

interface PremiumStatusResponse {
  isPremium: boolean;
  source: string | null;
  message?: string;
  subscriptions?: {
    count: number;
  };
}

interface PremiumPlansResponse {
  plans: unknown[];
  detectedRegion: string;
}

describe("HITO 3 integration: premium status public and authenticated API", () => {
  const runId = createRunId();
  let identity: TestIdentity;

  beforeAll(async () => {
    await cleanupLab08Data(runId);
    identity = await createAuthenticatedUser(runId);
  });

  afterAll(async () => {
    await cleanupLab08Data(runId);
    await disconnectPrisma();
  });

  it("returns a non-premium response for unauthenticated users without failing", async () => {
    const response = await apiRequest<PremiumStatusResponse>("/api/premium/status");

    expect(response.response.status).toBe(200);
    expect(response.body.isPremium).toBe(false);
    expect(response.body.source).toBeNull();
    expect(response.body.message).toBe("User not authenticated");
  });

  it("returns premium status structure for an authenticated non-premium test user", async () => {
    const response = await apiRequest<PremiumStatusResponse>("/api/premium/status", {
      cookieHeader: identity.cookieHeader
    });

    expect(response.response.status).toBe(200);
    expect(response.body.isPremium).toBe(false);
    expect(response.body.subscriptions?.count).toBe(0);
  });

  it("returns premium plans endpoint shape for an explicit region", async () => {
    const response = await apiRequest<PremiumPlansResponse>("/api/premium/plans?region=US");

    expect(response.response.status).toBe(200);
    expect(Array.isArray(response.body.plans)).toBe(true);
    expect(response.body.detectedRegion).toBe("US");
  });
});
