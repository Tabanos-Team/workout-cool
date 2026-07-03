import { ExerciseAttributeValueEnum, PrismaClient } from "@prisma/client";

import { apiRequest } from "./http";

const prisma = new PrismaClient();

export interface TestIdentity {
  runId: string;
  email: string;
  password: string;
  userId: string;
  cookieHeader: string;
}

export interface TestExercise {
  id: string;
  name: string;
}

interface SignUpResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export function createRunId() {
  return `lab08-${crypto.randomUUID()}`;
}

export async function createAuthenticatedUser(runId: string): Promise<TestIdentity> {
  const email = `${runId}@integration.test`;
  const password = "Password123!";

  const signUp = await apiRequest<SignUpResponse>("/api/auth/sign-up/email", {
    method: "POST",
    body: {
      email,
      password,
      name: "Lab 08 Tester",
      firstName: "Lab",
      lastName: "Tester"
    }
  });

  if (!signUp.response.ok || !signUp.cookieHeader) {
    throw new Error(`Unable to create authenticated test user: ${JSON.stringify(signUp.body)}`);
  }

  return {
    runId,
    email,
    password,
    userId: signUp.body.user.id,
    cookieHeader: signUp.cookieHeader
  };
}

export async function createTestExercise(runId: string): Promise<TestExercise> {
  const exercise = await prisma.exercise.create({
    data: {
      id: `${runId}-exercise`,
      name: "Lab 08 Bench Press",
      nameEn: "Lab 08 Bench Press",
      slug: `${runId}-bench-press`,
      slugEn: `${runId}-bench-press-en`
    }
  });

  return {
    id: exercise.id,
    name: exercise.name
  };
}

export function createWorkoutSessionPayload(runId: string, userId: string, exerciseId: string) {
  return {
    session: {
      id: `${runId}-session`,
      userId,
      startedAt: "2026-07-03T10:00:00.000Z",
      endedAt: "2026-07-03T10:45:00.000Z",
      status: "completed",
      muscles: [ExerciseAttributeValueEnum.CHEST, ExerciseAttributeValueEnum.TRICEPS],
      exercises: [
        {
          id: exerciseId,
          order: 0,
          sets: [
            {
              id: `${runId}-set-1`,
              setIndex: 0,
              types: ["REPS", "WEIGHT"],
              valuesInt: [10, 80],
              valuesSec: [],
              units: ["kg"],
              completed: true
            },
            {
              id: `${runId}-set-2`,
              setIndex: 1,
              types: ["REPS", "WEIGHT"],
              valuesInt: [8, 85],
              valuesSec: [],
              units: ["kg"],
              completed: true
            }
          ]
        }
      ]
    }
  };
}

export async function cleanupLab08Data(runId: string) {
  await prisma.workoutSession.deleteMany({
    where: {
      id: {
        startsWith: runId
      }
    }
  });

  await prisma.exercise.deleteMany({
    where: {
      id: {
        startsWith: runId
      }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: runId
      }
    }
  });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
