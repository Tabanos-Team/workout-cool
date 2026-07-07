import { ExerciseAttributeNameEnum, ExerciseAttributeValueEnum, PrismaClient, ProgramLevel, ProgramVisibility } from "@prisma/client";

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

export interface TestProgram {
  id: string;
  slug: string;
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

export async function createAttributedTestExercise(runId: string): Promise<TestExercise> {
  const exercise = await createTestExercise(`${runId}-attributed`);
  const primaryMuscleName = await upsertAttributeName(ExerciseAttributeNameEnum.PRIMARY_MUSCLE);
  const secondaryMuscleName = await upsertAttributeName(ExerciseAttributeNameEnum.SECONDARY_MUSCLE);
  const equipmentName = await upsertAttributeName(ExerciseAttributeNameEnum.EQUIPMENT);
  const chestValue = await upsertAttributeValue(primaryMuscleName.id, ExerciseAttributeValueEnum.CHEST);
  const bodyOnlyValue = await upsertAttributeValue(equipmentName.id, ExerciseAttributeValueEnum.BODY_ONLY);

  await prisma.exerciseAttribute.createMany({
    data: [
      {
        exerciseId: exercise.id,
        attributeNameId: primaryMuscleName.id,
        attributeValueId: chestValue.id
      },
      {
        exerciseId: exercise.id,
        attributeNameId: equipmentName.id,
        attributeValueId: bodyOnlyValue.id
      }
    ],
    skipDuplicates: true
  });

  await upsertAttributeValue(secondaryMuscleName.id, ExerciseAttributeValueEnum.TRICEPS);

  return exercise;
}

export async function createPublishedTestProgram(runId: string): Promise<TestProgram> {
  const program = await prisma.program.create({
    data: {
      slug: `${runId}-program`,
      slugEn: `${runId}-program-en`,
      slugEs: `${runId}-program-es`,
      slugPt: `${runId}-program-pt`,
      slugRu: `${runId}-program-ru`,
      slugZhCn: `${runId}-program-zh-cn`,
      title: "Lab Hito 3 Program",
      titleEn: "Lab Hito 3 Program",
      titleEs: "Programa Lab Hito 3",
      titlePt: "Programa Lab Hito 3",
      titleRu: "Lab Hito 3 Program",
      titleZhCn: "Lab Hito 3 Program",
      description: "Program created for integration testing.",
      descriptionEn: "Program created for integration testing.",
      descriptionEs: "Programa creado para pruebas de integración.",
      descriptionPt: "Programa criado para testes de integração.",
      descriptionRu: "Program created for integration testing.",
      descriptionZhCn: "Program created for integration testing.",
      category: "integration",
      image: "https://workout-cool-ten.vercel.app/og-image.png",
      level: ProgramLevel.BEGINNER,
      type: ExerciseAttributeValueEnum.STRENGTH,
      equipment: [ExerciseAttributeValueEnum.BODY_ONLY],
      isPremium: false,
      isActive: true,
      visibility: ProgramVisibility.PUBLISHED
    }
  });

  return {
    id: program.id,
    slug: program.slug
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
  await prisma.userProgramEnrollment.deleteMany({
    where: {
      OR: [
        {
          program: {
            slug: {
              startsWith: runId
            }
          }
        },
        {
          user: {
            email: {
              startsWith: runId
            }
          }
        }
      ]
    }
  });

  await prisma.program.deleteMany({
    where: {
      slug: {
        startsWith: runId
      }
    }
  });

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

async function upsertAttributeName(name: ExerciseAttributeNameEnum) {
  return prisma.exerciseAttributeName.upsert({
    where: { name },
    create: { name },
    update: {}
  });
}

async function upsertAttributeValue(attributeNameId: string, value: ExerciseAttributeValueEnum) {
  return prisma.exerciseAttributeValue.upsert({
    where: {
      attributeNameId_value: {
        attributeNameId,
        value
      }
    },
    create: {
      attributeNameId,
      value
    },
    update: {}
  });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
