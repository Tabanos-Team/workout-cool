-- Seed QA data for Programs integration, acceptance and E2E tests.
-- Target tables:
--   programs
--   program_coaches
--   program_weeks
--   program_sessions
--   program_session_exercises
--   program_suggested_sets
--
-- Note: the Prisma table name is program_session_exercises, not program_sessions_exercises.
-- The script also creates one minimal exercise because program_session_exercises.exerciseId
-- has a foreign key to exercises.id.

BEGIN;

WITH seed_exercise AS (
  INSERT INTO "exercises" (
    "id",
    "name",
    "nameEn",
    "description",
    "descriptionEn",
    "slug",
    "slugEn",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    'qa-program-push-up-exercise',
    'QA Program Push Up',
    'QA Program Push Up',
    'Exercise created for QA program tests.',
    'Exercise created for QA program tests.',
    'qa-program-push-up',
    'qa-program-push-up-en',
    NOW(),
    NOW()
  )
  ON CONFLICT ("slug")
  DO UPDATE SET
    "name" = EXCLUDED."name",
    "nameEn" = EXCLUDED."nameEn",
    "description" = EXCLUDED."description",
    "descriptionEn" = EXCLUDED."descriptionEn",
    "updatedAt" = NOW()
  RETURNING "id"
),
seed_program AS (
  INSERT INTO "programs" (
    "id",
    "slug",
    "slugEn",
    "slugEs",
    "slugPt",
    "slugRu",
    "slugZhCn",
    "title",
    "titleEn",
    "titleEs",
    "titlePt",
    "titleRu",
    "titleZhCn",
    "description",
    "descriptionEn",
    "descriptionEs",
    "descriptionPt",
    "descriptionRu",
    "descriptionZhCn",
    "category",
    "image",
    "level",
    "type",
    "durationWeeks",
    "sessionsPerWeek",
    "sessionDurationMin",
    "equipment",
    "isPremium",
    "isActive",
    "visibility",
    "participantCount",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    'qa-program-strength-foundation',
    'qa-strength-foundation',
    'qa-strength-foundation-en',
    'qa-base-fuerza',
    'qa-base-forca',
    'qa-strength-foundation-ru',
    'qa-strength-foundation-zh-cn',
    'QA Strength Foundation',
    'QA Strength Foundation',
    'QA Base de Fuerza',
    'QA Base de Forca',
    'QA Strength Foundation',
    'QA Strength Foundation',
    'Program created for integration, acceptance and E2E tests.',
    'Program created for integration, acceptance and E2E tests.',
    'Programa creado para pruebas de integracion, aceptacion y E2E.',
    'Programa criado para testes de integracao, aceitacao e E2E.',
    'Program created for integration, acceptance and E2E tests.',
    'Program created for integration, acceptance and E2E tests.',
    'qa',
    'https://workout-cool-ten.vercel.app/og-image.png',
    'BEGINNER'::"ProgramLevel",
    'STRENGTH'::"ExerciseAttributeValueEnum",
    1,
    1,
    35,
    ARRAY['BODY_ONLY'::"ExerciseAttributeValueEnum"],
    false,
    true,
    'PUBLISHED'::"ProgramVisibility",
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT ("slug")
  DO UPDATE SET
    "title" = EXCLUDED."title",
    "titleEn" = EXCLUDED."titleEn",
    "titleEs" = EXCLUDED."titleEs",
    "titlePt" = EXCLUDED."titlePt",
    "description" = EXCLUDED."description",
    "descriptionEn" = EXCLUDED."descriptionEn",
    "descriptionEs" = EXCLUDED."descriptionEs",
    "descriptionPt" = EXCLUDED."descriptionPt",
    "image" = EXCLUDED."image",
    "level" = EXCLUDED."level",
    "type" = EXCLUDED."type",
    "durationWeeks" = EXCLUDED."durationWeeks",
    "sessionsPerWeek" = EXCLUDED."sessionsPerWeek",
    "sessionDurationMin" = EXCLUDED."sessionDurationMin",
    "equipment" = EXCLUDED."equipment",
    "isPremium" = EXCLUDED."isPremium",
    "isActive" = EXCLUDED."isActive",
    "visibility" = EXCLUDED."visibility",
    "updatedAt" = NOW()
  RETURNING "id"
),
seed_coach AS (
  INSERT INTO "program_coaches" (
    "id",
    "programId",
    "name",
    "image",
    "order"
  )
  SELECT
    'qa-program-strength-foundation-coach',
    "id",
    'QA Coach',
    'https://workout-cool-ten.vercel.app/og-image.png',
    0
  FROM seed_program
  ON CONFLICT ("id")
  DO UPDATE SET
    "name" = EXCLUDED."name",
    "image" = EXCLUDED."image",
    "order" = EXCLUDED."order"
  RETURNING "id"
),
seed_week AS (
  INSERT INTO "program_weeks" (
    "id",
    "programId",
    "weekNumber",
    "title",
    "titleEn",
    "titleEs",
    "titlePt",
    "titleRu",
    "titleZhCn",
    "description",
    "descriptionEn",
    "descriptionEs",
    "descriptionPt",
    "descriptionRu",
    "descriptionZhCn"
  )
  SELECT
    'qa-program-strength-foundation-week-1',
    "id",
    1,
    'Week 1',
    'Week 1',
    'Semana 1',
    'Semana 1',
    'Week 1',
    'Week 1',
    'Foundation week for QA tests.',
    'Foundation week for QA tests.',
    'Semana base para pruebas QA.',
    'Semana base para testes QA.',
    'Foundation week for QA tests.',
    'Foundation week for QA tests.'
  FROM seed_program
  ON CONFLICT ("programId", "weekNumber")
  DO UPDATE SET
    "title" = EXCLUDED."title",
    "titleEn" = EXCLUDED."titleEn",
    "titleEs" = EXCLUDED."titleEs",
    "titlePt" = EXCLUDED."titlePt",
    "description" = EXCLUDED."description",
    "descriptionEn" = EXCLUDED."descriptionEn",
    "descriptionEs" = EXCLUDED."descriptionEs",
    "descriptionPt" = EXCLUDED."descriptionPt"
  RETURNING "id"
),
seed_session AS (
  INSERT INTO "program_sessions" (
    "id",
    "weekId",
    "sessionNumber",
    "title",
    "titleEn",
    "titleEs",
    "titlePt",
    "titleRu",
    "titleZhCn",
    "slug",
    "slugEn",
    "slugEs",
    "slugPt",
    "slugRu",
    "slugZhCn",
    "description",
    "descriptionEn",
    "descriptionEs",
    "descriptionPt",
    "descriptionRu",
    "descriptionZhCn",
    "equipment",
    "estimatedMinutes",
    "isPremium"
  )
  SELECT
    'qa-program-strength-foundation-session-1',
    "id",
    1,
    'Push Up Foundation',
    'Push Up Foundation',
    'Base de flexiones',
    'Base de flexoes',
    'Push Up Foundation',
    'Push Up Foundation',
    'qa-push-up-foundation',
    'qa-push-up-foundation-en',
    'qa-base-flexiones',
    'qa-base-flexoes',
    'qa-push-up-foundation-ru',
    'qa-push-up-foundation-zh-cn',
    'Session created for QA program tests.',
    'Session created for QA program tests.',
    'Sesion creada para pruebas QA de programas.',
    'Sessao criada para testes QA de programas.',
    'Session created for QA program tests.',
    'Session created for QA program tests.',
    ARRAY['BODY_ONLY'::"ExerciseAttributeValueEnum"],
    35,
    false
  FROM seed_week
  ON CONFLICT ("weekId", "sessionNumber")
  DO UPDATE SET
    "title" = EXCLUDED."title",
    "titleEn" = EXCLUDED."titleEn",
    "titleEs" = EXCLUDED."titleEs",
    "titlePt" = EXCLUDED."titlePt",
    "description" = EXCLUDED."description",
    "descriptionEn" = EXCLUDED."descriptionEn",
    "descriptionEs" = EXCLUDED."descriptionEs",
    "descriptionPt" = EXCLUDED."descriptionPt",
    "equipment" = EXCLUDED."equipment",
    "estimatedMinutes" = EXCLUDED."estimatedMinutes",
    "isPremium" = EXCLUDED."isPremium"
  RETURNING "id"
),
seed_session_exercise AS (
  INSERT INTO "program_session_exercises" (
    "id",
    "sessionId",
    "exerciseId",
    "order",
    "instructions",
    "instructionsEn",
    "instructionsEs",
    "instructionsPt",
    "instructionsRu",
    "instructionsZhCn"
  )
  SELECT
    'qa-program-strength-foundation-session-exercise-1',
    seed_session."id",
    seed_exercise."id",
    0,
    'Complete each repetition with controlled tempo.',
    'Complete each repetition with controlled tempo.',
    'Completa cada repeticion con tempo controlado.',
    'Complete cada repeticao com ritmo controlado.',
    'Complete each repetition with controlled tempo.',
    'Complete each repetition with controlled tempo.'
  FROM seed_session, seed_exercise
  ON CONFLICT ("sessionId", "order")
  DO UPDATE SET
    "exerciseId" = EXCLUDED."exerciseId",
    "instructions" = EXCLUDED."instructions",
    "instructionsEn" = EXCLUDED."instructionsEn",
    "instructionsEs" = EXCLUDED."instructionsEs",
    "instructionsPt" = EXCLUDED."instructionsPt"
  RETURNING "id"
),
seed_sets AS (
  INSERT INTO "program_suggested_sets" (
    "id",
    "programSessionExerciseId",
    "setIndex",
    "types",
    "valuesInt",
    "valuesSec",
    "units"
  )
  SELECT
    'qa-program-strength-foundation-set-1',
    "id",
    0,
    ARRAY['BODYWEIGHT'::"WorkoutSetType", 'REPS'::"WorkoutSetType"],
    ARRAY[0, 10],
    ARRAY[]::INTEGER[],
    ARRAY[]::"WorkoutSetUnit"[]
  FROM seed_session_exercise
  ON CONFLICT ("programSessionExerciseId", "setIndex")
  DO UPDATE SET
    "types" = EXCLUDED."types",
    "valuesInt" = EXCLUDED."valuesInt",
    "valuesSec" = EXCLUDED."valuesSec",
    "units" = EXCLUDED."units"
  RETURNING "programSessionExerciseId"
)
INSERT INTO "program_suggested_sets" (
  "id",
  "programSessionExerciseId",
  "setIndex",
  "types",
  "valuesInt",
  "valuesSec",
  "units"
)
SELECT
  'qa-program-strength-foundation-set-2',
  "programSessionExerciseId",
  1,
  ARRAY['BODYWEIGHT'::"WorkoutSetType", 'REPS'::"WorkoutSetType"],
  ARRAY[0, 12],
  ARRAY[]::INTEGER[],
  ARRAY[]::"WorkoutSetUnit"[]
FROM seed_sets
ON CONFLICT ("programSessionExerciseId", "setIndex")
DO UPDATE SET
  "types" = EXCLUDED."types",
  "valuesInt" = EXCLUDED."valuesInt",
  "valuesSec" = EXCLUDED."valuesSec",
  "units" = EXCLUDED."units";

COMMIT;

-- Useful QA URLs after running this seed:
--   /programs/qa-strength-foundation
--   /programs/qa-strength-foundation/session/qa-push-up-foundation
--   /api/programs/qa-strength-foundation
--   /api/programs/qa-strength-foundation/sessions/qa-push-up-foundation
