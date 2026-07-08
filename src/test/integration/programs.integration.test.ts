import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupLab08Data,
  createAuthenticatedUser,
  createAttributedTestExercise,
  createPublishedTestProgram,
  createRunId,
  disconnectPrisma,
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
    await cleanupLab08Data(runId);
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
