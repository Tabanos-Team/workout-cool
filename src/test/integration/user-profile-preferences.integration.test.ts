import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupLab08Data,
  createAuthenticatedUser,
  createRunId,
  disconnectPrisma,
  type TestIdentity
} from "./helpers/workout-session-fixtures";
import { apiRequest } from "./helpers/http";

interface ProfileResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface SuccessResponse {
  success: boolean;
}

interface PreferencesResponse {
  preferences: {
    goals: string[];
    fitnessLevel: string | null;
    equipment: string[];
    muscles: string[];
    duration: number | null;
    weeklyFrequency: number;
  } | null;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

describe("HITO 3 integration: user profile and preferences API", () => {
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

  it("rejects unauthenticated profile access with HTTP 401", async () => {
    const profile = await apiRequest<ErrorResponse>("/api/user/profile");

    expect(profile.response.status).toBe(401);
    expect(profile.body.error).toBe("UNAUTHORIZED");
  });

  it("reads the authenticated user profile", async () => {
    const profile = await apiRequest<ProfileResponse>("/api/user/profile", {
      cookieHeader: identity.cookieHeader
    });

    expect(profile.response.status).toBe(200);
    expect(profile.body.user.id).toBe(identity.userId);
    expect(profile.body.user.email).toBe(identity.email);
  });

  it("updates user profile fields and rejects invalid image URLs", async () => {
    const update = await apiRequest<SuccessResponse>("/api/user/profile", {
      method: "PUT",
      cookieHeader: identity.cookieHeader,
      body: {
        firstName: "Hito",
        lastName: "Tres",
        image: "https://workout-cool-ten.vercel.app/avatar.png"
      }
    });

    expect(update.response.status).toBe(200);
    expect(update.body.success).toBe(true);

    const invalid = await apiRequest<ErrorResponse>("/api/user/profile", {
      method: "PUT",
      cookieHeader: identity.cookieHeader,
      body: {
        image: "not-a-url"
      }
    });

    expect(invalid.response.status).toBe(400);
    expect(invalid.body.error).toBe("INVALID_INPUT");
    expect(invalid.body.details).toBeDefined();
  });

  it("persists onboarding preferences and returns them with GET", async () => {
    const preferencesPayload = {
      goals: ["strength", "consistency"],
      fitnessLevel: "beginner",
      equipment: ["BODY_ONLY"],
      muscles: ["CHEST"],
      duration: 45,
      weeklyFrequency: 3,
      notificationDays: [1, 3, 5],
      notificationTime: "07:30"
    };

    const update = await apiRequest<SuccessResponse>("/api/user/preferences", {
      method: "PUT",
      cookieHeader: identity.cookieHeader,
      body: preferencesPayload
    });

    expect(update.response.status).toBe(200);
    expect(update.body.success).toBe(true);

    const preferences = await apiRequest<PreferencesResponse>("/api/user/preferences", {
      cookieHeader: identity.cookieHeader
    });

    expect(preferences.response.status).toBe(200);
    expect(preferences.body.preferences?.weeklyFrequency).toBe(3);
    expect(preferences.body.preferences?.goals).toEqual(["strength", "consistency"]);
  });

  it("rejects invalid onboarding preferences with HTTP 400", async () => {
    const invalid = await apiRequest<ErrorResponse>("/api/user/preferences", {
      method: "PUT",
      cookieHeader: identity.cookieHeader,
      body: {
        goals: [],
        fitnessLevel: "beginner",
        equipment: [],
        muscles: [],
        duration: null,
        weeklyFrequency: 8
      }
    });

    expect(invalid.response.status).toBe(400);
    expect(invalid.body.error).toBe("INVALID_INPUT");
  });
});
