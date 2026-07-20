import {
  ExerciseAttributeNameEnum,
  ExerciseAttributeValueEnum,
  PrismaClient,
  ProgramLevel,
  ProgramVisibility,
  WorkoutSetType
} from "@prisma/client";

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
  sessionId?: string;
  sessionSlug?: string;
}

interface SignUpResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export function createRunId() {
  if (process.env.TEST_RUN_ID) {
    return process.env.TEST_RUN_ID;
  }

  return `lab08-${crypto.randomUUID()}`;
}

export function shouldKeepIntegrationData() {
  return process.env.KEEP_INTEGRATION_DATA === "true";
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

export async function createPublishedTestProgram(runId: string, exerciseId?: string): Promise<TestProgram> {
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
      descriptionEs: "Programa creado para pruebas de integracion.",
      descriptionPt: "Programa criado para testes de integracao.",
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

  if (!exerciseId) {
    return {
      id: program.id,
      slug: program.slug
    };
  }

  await prisma.programCoach.create({
    data: {
      id: `${runId}-coach`,
      programId: program.id,
      name: "Lab Coach",
      image: "https://workout-cool-ten.vercel.app/og-image.png",
      order: 0
    }
  });

  const week = await prisma.programWeek.create({
    data: {
      id: `${runId}-week-1`,
      programId: program.id,
      weekNumber: 1,
      title: "Week 1",
      titleEn: "Week 1",
      titleEs: "Semana 1",
      titlePt: "Semana 1",
      titleRu: "Week 1",
      titleZhCn: "Week 1",
      description: "Introductory week for integration testing.",
      descriptionEn: "Introductory week for integration testing.",
      descriptionEs: "Semana introductoria para pruebas de integracion.",
      descriptionPt: "Semana introdutoria para testes de integracao.",
      descriptionRu: "Introductory week for integration testing.",
      descriptionZhCn: "Introductory week for integration testing."
    }
  });

  const session = await prisma.programSession.create({
    data: {
      id: `${runId}-session-1`,
      weekId: week.id,
      sessionNumber: 1,
      title: "Chest Foundation",
      titleEn: "Chest Foundation",
      titleEs: "Base de pecho",
      titlePt: "Base de peito",
      titleRu: "Chest Foundation",
      titleZhCn: "Chest Foundation",
      slug: `${runId}-chest-foundation`,
      slugEn: `${runId}-chest-foundation-en`,
      slugEs: `${runId}-base-pecho`,
      slugPt: `${runId}-base-peito`,
      slugRu: `${runId}-chest-foundation-ru`,
      slugZhCn: `${runId}-chest-foundation-zh-cn`,
      description: "Session created for integration testing.",
      descriptionEn: "Session created for integration testing.",
      descriptionEs: "Sesion creada para pruebas de integracion.",
      descriptionPt: "Sessao criada para testes de integracao.",
      descriptionRu: "Session created for integration testing.",
      descriptionZhCn: "Session created for integration testing.",
      equipment: [ExerciseAttributeValueEnum.BODY_ONLY],
      estimatedMinutes: 35,
      isPremium: false
    }
  });

  const sessionExercise = await prisma.programSessionExercise.create({
    data: {
      id: `${runId}-session-exercise-1`,
      sessionId: session.id,
      exerciseId,
      order: 0,
      instructions: "Complete the movement with controlled tempo.",
      instructionsEn: "Complete the movement with controlled tempo.",
      instructionsEs: "Completa el movimiento con tempo controlado.",
      instructionsPt: "Complete o movimento com ritmo controlado.",
      instructionsRu: "Complete the movement with controlled tempo.",
      instructionsZhCn: "Complete the movement with controlled tempo."
    }
  });

  await prisma.programSuggestedSet.createMany({
    data: [
      {
        id: `${runId}-suggested-set-1`,
        programSessionExerciseId: sessionExercise.id,
        setIndex: 0,
        types: [WorkoutSetType.BODYWEIGHT, WorkoutSetType.REPS],
        valuesInt: [0, 10],
        valuesSec: [],
        units: []
      },
      {
        id: `${runId}-suggested-set-2`,
        programSessionExerciseId: sessionExercise.id,
        setIndex: 1,
        types: [WorkoutSetType.BODYWEIGHT, WorkoutSetType.REPS],
        valuesInt: [0, 12],
        valuesSec: [],
        units: []
      }
    ]
  });

  return {
    id: program.id,
    slug: program.slug,
    sessionId: session.id,
    sessionSlug: session.slug
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

export async function getProgramIntegrationGraph(programId: string) {
  return prisma.program.findUnique({
    where: { id: programId },
    include: {
      coaches: true,
      weeks: {
        include: {
          sessions: {
            include: {
              exercises: {
                include: {
                  exercise: true,
                  suggestedSets: true
                }
              },
              userProgress: {
                include: {
                  workoutSession: {
                    include: {
                      exercises: {
                        include: {
                          sets: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      enrollments: {
        include: {
          sessionProgress: true
        }
      }
    }
  });
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
      OR: [
        {
          id: {
            startsWith: runId
          }
        },
        {
          exercises: {
            some: {
              exerciseId: {
                startsWith: runId
              }
            }
          }
        }
      ]
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
