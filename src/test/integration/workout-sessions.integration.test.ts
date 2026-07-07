import { describe, expect, it, afterAll, beforeAll } from "vitest";

import {
  cleanupLab08Data,
  createAuthenticatedUser,
  createRunId,
  createTestExercise,
  createWorkoutSessionPayload,
  disconnectPrisma,
  type TestExercise,
  type TestIdentity
} from "./helpers/workout-session-fixtures";
import { apiRequest } from "./helpers/http";

interface SyncWorkoutSessionResponse {
  success: boolean;
  data: {
    id: string;
  };
}

interface WorkoutSessionListItem {
  id: string;
  userId: string;
  rating: number | null;
  ratingComment: string | null;
  exercises: Array<{
    id: string;
    sets: Array<{
      valuesInt: number[];
      completed: boolean;
    }>;
  }>;
}

interface RatingResponse {
  success: boolean;
  data: {
    rating: number;
    ratingComment: string;
  };
}

interface SummaryResponse {
  success: boolean;
  data: {
    id: string;
    totalSets: number;
    totalReps: number;
    totalVolume: number;
    rating: number | null;
    ratingComment: string | null;
  };
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

describe("LAB 08 integration: workout session API flow", () => {
  const runId = createRunId();
  let identity: TestIdentity;
  let exercise: TestExercise;
  let sessionPayload: ReturnType<typeof createWorkoutSessionPayload>;

  beforeAll(async () => {
    await cleanupLab08Data(runId);

    identity = await createAuthenticatedUser(runId);
    exercise = await createTestExercise(runId);
    sessionPayload = createWorkoutSessionPayload(runId, identity.userId, exercise.id);
  });

  afterAll(async () => {
    await cleanupLab08Data(runId);
    await disconnectPrisma();
  });

  it("Ejercicio 1: persists a workout session with POST and reads it with GET", async () => {
    const sync = await apiRequest<SyncWorkoutSessionResponse>("/api/workout-sessions/sync", {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: sessionPayload
    });

    expect(sync.response.status).toBe(200);
    expect(sync.body.success).toBe(true);
    expect(sync.body.data.id).toBe(sessionPayload.session.id);

    const list = await apiRequest<WorkoutSessionListItem[]>(`/api/workout-sessions/user/${identity.userId}`, {
      cookieHeader: identity.cookieHeader
    });

    expect(list.response.status).toBe(200);

    const persisted = list.body.find((session) => session.id === sessionPayload.session.id);

    expect(persisted).toBeDefined();
    expect(persisted?.userId).toBe(identity.userId);
    expect(persisted?.exercises[0]?.id).toBe(exercise.id);
    expect(persisted?.exercises[0]?.sets).toHaveLength(2);
  });

  it("Ejercicio 1: updates a quantitative property and verifies the saved state with GET", async () => {
    const rating = await apiRequest<RatingResponse>(`/api/workout-sessions/${sessionPayload.session.id}/rating`, {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: {
        rating: 5,
        ratingComment: "Excellent integration workout"
      }
    });

    expect(rating.response.status).toBe(200);
    expect(rating.body.data.rating).toBe(5);

    const summary = await apiRequest<SummaryResponse>(`/api/workout-sessions/${sessionPayload.session.id}/summary`, {
      cookieHeader: identity.cookieHeader
    });

    expect(summary.response.status).toBe(200);
    expect(summary.body.data.rating).toBe(5);
    expect(summary.body.data.ratingComment).toBe("Excellent integration workout");
    expect(summary.body.data.totalSets).toBe(2);
    expect(summary.body.data.totalReps).toBe(18);
    expect(summary.body.data.totalVolume).toBe(1480);
  });

  it("Ejercicio 1 y 2 sintáctico: rejects invalid input with HTTP 400 and validation details", async () => {
    const invalidRating = await apiRequest<ErrorResponse>(`/api/workout-sessions/${sessionPayload.session.id}/rating`, {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: {
        rating: 9
      }
    });

    expect(invalidRating.response.status).toBe(400);
    expect(invalidRating.body.error).toBe("INVALID_INPUT");
    expect(invalidRating.body.details).toBeDefined();
  });

  it("Ejercicio 2 semántico: rejects technically valid data that references a missing exercise", async () => {
    const missingExercisePayload = createWorkoutSessionPayload(`${runId}-missing`, identity.userId, `${runId}-missing-exercise`);

    const sync = await apiRequest<ErrorResponse>("/api/workout-sessions/sync", {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: missingExercisePayload
    });

    expect(sync.response.status).toBe(400);
    expect(sync.body.error).toContain("Exercises not found");
  });

  it("Ejercicio 2 resiliencia: aborts a slow API request when the client timeout is exceeded", async () => {
    await expect(
      apiRequest<WorkoutSessionListItem[]>(`/api/workout-sessions/user/${identity.userId}`, {
        cookieHeader: identity.cookieHeader,
        headers: {
          "x-lab08-delay-ms": "250"
        },
        timeoutMs: 25
      })
    ).rejects.toThrow();
  });
});
