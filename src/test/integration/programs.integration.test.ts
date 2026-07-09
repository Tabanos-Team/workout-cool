import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupLab08Data,
  createAuthenticatedUser,
  createAttributedTestExercise,
  createPublishedTestProgram,
  createRunId,
  disconnectPrisma,
  getProgramIntegrationGraph,
  shouldKeepIntegrationData,
  type TestExercise,
  type TestIdentity,
  type TestProgram
} from "./helpers/workout-session-fixtures";
import { apiRequest } from "./helpers/http";

interface ExerciseSearchGroup {
  muscle: string;
  exercises: Array<{
    id: string;
    name: string;
  }>;
}

interface ExerciseCatalogResponse {
  data: Array<{
    id: string;
    name: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
  };
}

interface ProgramListItem {
  id: string;
  slug: string;
  title: string;
}

interface ProgramDetail {
  id: string;
  slug: string;
  title: string;
  totalEnrollments: number;
  coaches: Array<{ id: string }>;
  weeks: Array<{
    sessions: Array<{
      slug: string;
      totalExercises: number;
    }>;
  }>;
}

interface ProgramSessionDetail {
  session: {
    id: string;
    slug: string;
    exercises: Array<{
      exerciseId: string;
      suggestedSets: Array<{
        setIndex: number;
        types: string[];
        valuesInt: number[];
      }>;
    }>;
  };
  program: {
    id: string;
    slug: string;
  };
  week: {
    weekNumber: number;
  };
}

interface EnrollmentResponse {
  isNew?: boolean;
  isEnrolled?: boolean;
  enrollment?: {
    id: string;
    userId: string;
    programId: string;
  };
}

interface StartSessionProgressResponse {
  sessionProgress: {
    id: string;
    enrollmentId: string;
    sessionId: string;
    completedAt: string | null;
    workoutSessionId: string | null;
  };
  isNew: boolean;
  sessionData?: {
    id: string;
  };
}

interface SyncWorkoutSessionResponse {
  success: boolean;
  data: {
    id: string;
  };
}

interface CompleteSessionProgressResponse {
  sessionProgress: {
    id: string;
    completedAt: string | null;
    workoutSessionId: string | null;
  };
  isCompleted: boolean;
  nextWeek: number | null;
  nextSession: number | null;
}

interface ProgramProgressResponse {
  enrollment: {
    id: string;
    completedSessions: number;
    isActive: boolean;
    completedAt: string | null;
  };
  stats: {
    totalSessions: number;
    completedSessions: number;
    completionPercentage: number;
    isProgramCompleted: boolean;
  };
}

interface ErrorResponse {
  error: string;
}

describe("HITO 3 integration: exercises and programs API", () => {
  const runId = createRunId();
  let identity: TestIdentity;
  let exercise: TestExercise;
  let program: TestProgram;

  beforeAll(async () => {
    await cleanupLab08Data(runId);
    identity = await createAuthenticatedUser(runId);
    exercise = await createAttributedTestExercise(runId);
    program = await createPublishedTestProgram(runId, exercise.id);
  });

  afterAll(async () => {
    if (!shouldKeepIntegrationData()) {
      await cleanupLab08Data(runId);
    }

    await disconnectPrisma();
  });

  it("searches exercises by muscle and equipment through API validation and Prisma", async () => {
    const response = await apiRequest<ExerciseSearchGroup[]>("/api/exercises?equipment=BODY_ONLY&muscles=CHEST&limit=3");

    expect(response.response.status).toBe(200);
    expect(response.body.some((group) => group.muscle === "CHEST")).toBe(true);
    expect(response.body.flatMap((group) => group.exercises).some((item) => item.id === exercise.id)).toBe(true);
  });

  it("rejects invalid exercise query parameters with HTTP 400", async () => {
    const response = await apiRequest<ErrorResponse>("/api/exercises?equipment=BODY_ONLY&muscles=CHEST&limit=99");

    expect(response.response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_INPUT");
  });

  it("lists exercises from the public catalog with pagination metadata", async () => {
    const response = await apiRequest<ExerciseCatalogResponse>(`/api/exercises/all?search=${encodeURIComponent(exercise.name)}&limit=5`);

    expect(response.response.status).toBe(200);
    expect(response.body.pagination.limit).toBe(5);
    expect(response.body.data.some((item) => item.id === exercise.id)).toBe(true);
  });

  it("lists public programs and fetches a program detail by slug", async () => {
    expect(program.sessionSlug).toBeDefined();
    const sessionSlug = program.sessionSlug!;
    const list = await apiRequest<ProgramListItem[]>("/api/programs");

    expect(list.response.status).toBe(200);
    expect(list.body.some((item) => item.slug === program.slug)).toBe(true);

    const detail = await apiRequest<ProgramDetail>(`/api/programs/${program.slug}`);

    expect(detail.response.status).toBe(200);
    expect(detail.body.id).toBe(program.id);
    expect(detail.body.slug).toBe(program.slug);
    expect(detail.body.coaches).toHaveLength(1);
    expect(detail.body.weeks[0]?.sessions[0]?.slug).toBe(sessionSlug);
    expect(detail.body.weeks[0]?.sessions[0]?.totalExercises).toBe(1);
  });

  it("fetches a program session detail with exercises and suggested sets", async () => {
    expect(program.sessionSlug).toBeDefined();
    const sessionSlug = program.sessionSlug!;
    const detail = await apiRequest<ProgramSessionDetail>(`/api/programs/${program.slug}/sessions/${sessionSlug}`);

    expect(detail.response.status).toBe(200);
    expect(detail.body.program.id).toBe(program.id);
    expect(detail.body.session.slug).toBe(sessionSlug);
    expect(detail.body.week.weekNumber).toBe(1);
    expect(detail.body.session.exercises).toHaveLength(1);
    expect(detail.body.session.exercises[0]?.exerciseId).toBe(exercise.id);
    expect(detail.body.session.exercises[0]?.suggestedSets).toHaveLength(2);
    expect(detail.body.session.exercises[0]?.suggestedSets[0]?.types).toEqual(["BODYWEIGHT", "REPS"]);
    expect(detail.body.session.exercises[0]?.suggestedSets[0]?.valuesInt).toEqual([0, 10]);
  });

  it("enrolls an authenticated user in a program and reads enrollment status", async () => {
    const enrollment = await apiRequest<EnrollmentResponse>(`/api/programs/${program.slug}/enroll`, {
      method: "POST",
      cookieHeader: identity.cookieHeader
    });

    expect(enrollment.response.status).toBe(200);
    expect(enrollment.body.isNew).toBe(true);
    expect(enrollment.body.enrollment?.userId).toBe(identity.userId);
    expect(enrollment.body.enrollment?.programId).toBe(program.id);

    const status = await apiRequest<EnrollmentResponse>(`/api/programs/${program.slug}/enroll`, {
      cookieHeader: identity.cookieHeader
    });

    expect(status.response.status).toBe(200);
    expect(status.body.isEnrolled).toBe(true);
  });

  it("starts, syncs and completes a program session through the deployed-compatible API flow", async () => {
    expect(program.sessionId).toBeDefined();
    const programSessionId = program.sessionId!;
    const enrollment = await apiRequest<EnrollmentResponse>(`/api/programs/${program.slug}/enroll`, {
      method: "POST",
      cookieHeader: identity.cookieHeader
    });
    const enrollmentId = enrollment.body.enrollment?.id;

    expect(enrollment.response.status).toBe(200);
    expect(enrollmentId).toBeDefined();

    const started = await apiRequest<StartSessionProgressResponse>("/api/programs/session-progress/start", {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: {
        enrollmentId,
        sessionId: programSessionId
      }
    });
    const sessionProgressId = started.body.sessionProgress.id;

    expect(started.response.status).toBe(200);
    expect(started.body.sessionProgress.enrollmentId).toBe(enrollmentId);
    expect(started.body.sessionProgress.sessionId).toBe(programSessionId);
    expect(started.body.sessionProgress.completedAt).toBeNull();

    const workoutSessionId = `${runId}-program-completion-workout`;
    const sync = await apiRequest<SyncWorkoutSessionResponse>("/api/workout-sessions/sync", {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: {
        session: {
          id: workoutSessionId,
          userId: identity.userId,
          startedAt: "2026-07-08T00:20:00.000Z",
          endedAt: "2026-07-08T00:55:00.000Z",
          status: "completed",
          muscles: ["CHEST"],
          exercises: [
            {
              id: exercise.id,
              order: 0,
              sets: [
                {
                  id: `${runId}-program-completion-set-1`,
                  setIndex: 0,
                  types: ["BODYWEIGHT", "REPS"],
                  valuesInt: [0, 10],
                  valuesSec: [],
                  units: [],
                  completed: true
                },
                {
                  id: `${runId}-program-completion-set-2`,
                  setIndex: 1,
                  types: ["BODYWEIGHT", "REPS"],
                  valuesInt: [0, 12],
                  valuesSec: [],
                  units: [],
                  completed: true
                }
              ]
            }
          ]
        }
      }
    });

    expect(sync.response.status).toBe(200);
    expect(sync.body.success).toBe(true);
    expect(sync.body.data.id).toBe(workoutSessionId);

    const completed = await apiRequest<CompleteSessionProgressResponse>(`/api/programs/session-progress/${sessionProgressId}/complete`, {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: {
        workoutSessionId
      }
    });

    expect(completed.response.status).toBe(200);
    expect(completed.body.sessionProgress.id).toBe(sessionProgressId);
    expect(completed.body.sessionProgress.workoutSessionId).toBe(workoutSessionId);
    expect(completed.body.sessionProgress.completedAt).toBeTruthy();
    expect(completed.body.isCompleted).toBe(true);
    expect(completed.body.nextWeek).toBeNull();
    expect(completed.body.nextSession).toBeNull();

    const progress = await apiRequest<ProgramProgressResponse>(`/api/programs/${program.slug}/progress`, {
      cookieHeader: identity.cookieHeader
    });

    expect(progress.response.status).toBe(200);
    expect(progress.body.enrollment.id).toBe(enrollmentId);
    expect(progress.body.stats.totalSessions).toBe(1);
    expect(progress.body.stats.completedSessions).toBe(1);
    expect(progress.body.stats.completionPercentage).toBe(100);
    expect(progress.body.stats.isProgramCompleted).toBe(true);

    const graph = await getProgramIntegrationGraph(program.id);
    const week = graph?.weeks[0];
    const session = week?.sessions[0];
    const sessionExercise = session?.exercises[0];
    const progressRow = session?.userProgress[0];

    expect(graph?.id).toBe(program.id);
    expect(graph?.coaches).toHaveLength(1);
    expect(graph?.enrollments).toHaveLength(1);
    expect(graph?.enrollments[0]?.completedSessions).toBe(1);
    expect(graph?.enrollments[0]?.sessionProgress).toHaveLength(1);
    expect(week?.id).toBeDefined();
    expect(session?.id).toBe(programSessionId);
    expect(sessionExercise?.exerciseId).toBe(exercise.id);
    expect(sessionExercise?.suggestedSets).toHaveLength(2);
    expect(progressRow?.id).toBe(sessionProgressId);
    expect(progressRow?.workoutSessionId).toBe(workoutSessionId);
    expect(progressRow?.workoutSession?.id).toBe(workoutSessionId);
    expect(progressRow?.workoutSession?.exercises[0]?.sets).toHaveLength(2);
  });

  it("rejects unauthenticated program enrollment and missing program slugs", async () => {
    const unauthorized = await apiRequest<ErrorResponse>(`/api/programs/${program.slug}/enroll`, {
      method: "POST"
    });

    expect(unauthorized.response.status).toBe(401);

    const missing = await apiRequest<ErrorResponse>(`/api/programs/${runId}-missing-program`);

    expect(missing.response.status).toBe(404);
    expect(missing.body.error).toBe("Program not found");
  });
});
