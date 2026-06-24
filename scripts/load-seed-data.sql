-- =========================================================================
-- SQL SEED SCRIPT FOR WORKOUT-COOL (NEON DATABASE)
-- Targets: Exercises, Muscles, Equipment, and User Statistics Progression
-- User ID: TTEEJ9BP74nYMSa2YFEU6IbWbHTFfIBn
-- =========================================================================

-- 1. SET USER TO PREMIUM AND ENSURE SUBSCRIPTION RECORD EXISTS
-- This satisfies PremiumService.checkUserPremiumStatus(userId)
INSERT INTO "user" ("id", "firstName", "lastName", "name", "email", "emailVerified", "createdAt", "updatedAt", "isPremium", "role")
VALUES ('TTEEJ9BP74nYMSa2YFEU6IbWbHTFfIBn', 'Richard', 'Workout', 'Richard Workout', 'richard.workout@example.com', true, NOW() - INTERVAL '1 year', NOW(), true, 'user'::"UserRole")
ON CONFLICT ("id") DO UPDATE SET "isPremium" = true, "updatedAt" = NOW();

-- Create a subscription plan if it doesn't exist
INSERT INTO "subscription_plans" ("id", "priceMonthly", "priceYearly", "currency", "interval", "isActive", "createdAt", "updatedAt")
VALUES ('plan-premium', 9.99, 99.99, 'EUR', 'month', true, NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 year')
ON CONFLICT ("id") DO NOTHING;

-- Create user subscription
INSERT INTO "subscriptions" ("id", "userId", "planId", "status", "startedAt", "currentPeriodEnd", "platform", "createdAt", "updatedAt")
VALUES ('sub-user-premium', 'TTEEJ9BP74nYMSa2YFEU6IbWbHTFfIBn', 'plan-premium', 'ACTIVE'::"SubscriptionStatus", NOW() - INTERVAL '1 year', NOW() + INTERVAL '1 year', 'WEB'::"Platform", NOW() - INTERVAL '1 year', NOW())
ON CONFLICT ("userId", "platform") DO UPDATE SET "status" = 'ACTIVE'::"SubscriptionStatus", "currentPeriodEnd" = NOW() + INTERVAL '1 year', "updatedAt" = NOW();


-- 2. ENSURE EXERCISE ATTRIBUTE NAMES AND VALUES EXIST
-- Insert attribute names
INSERT INTO "exercise_attribute_names" ("id", "name", "createdAt", "updatedAt")
VALUES 
  ('attr-name-type', 'TYPE'::"ExerciseAttributeNameEnum", NOW(), NOW()),
  ('attr-name-primary', 'PRIMARY_MUSCLE'::"ExerciseAttributeNameEnum", NOW(), NOW()),
  ('attr-name-secondary', 'SECONDARY_MUSCLE'::"ExerciseAttributeNameEnum", NOW(), NOW()),
  ('attr-name-equip', 'EQUIPMENT'::"ExerciseAttributeNameEnum", NOW(), NOW()),
  ('attr-name-mech', 'MECHANICS_TYPE'::"ExerciseAttributeNameEnum", NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- Insert attribute values mapping to their name IDs via subqueries
INSERT INTO "exercise_attribute_values" ("id", "attributeNameId", "value", "createdAt", "updatedAt")
VALUES
  ('val-type-strength', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), 'STRENGTH'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-type-plyometrics', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), 'PLYOMETRICS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-type-cardio', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), 'CARDIO'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-type-crossfit', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), 'CROSSFIT'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  
  ('val-muscle-quads', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'QUADRICEPS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-glutes', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'GLUTES'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-hamstrings', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'HAMSTRINGS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-shoulders', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'SHOULDERS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-biceps', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'BICEPS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-triceps', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'TRICEPS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-chest', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'CHEST'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-back', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'BACK'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-forearms', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'FOREARMS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-fullbody', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), 'FULL_BODY'::"ExerciseAttributeValueEnum", NOW(), NOW()),

  ('val-muscle-sec-glutes', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), 'GLUTES'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-sec-hamstrings', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), 'HAMSTRINGS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-sec-shoulders', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), 'SHOULDERS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-sec-triceps', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), 'TRICEPS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-muscle-sec-forearms', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), 'FOREARMS'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  
  ('val-equip-barbell', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), 'BARBELL'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-equip-dumbbell', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), 'DUMBBELL'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-equip-cable', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), 'CABLE'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-equip-bench', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), 'BENCH'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-equip-body', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), 'BODY_ONLY'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-equip-rope', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), 'ROPE'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-equip-bar', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), 'BAR'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  
  ('val-mech-compound', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE'), 'COMPOUND'::"ExerciseAttributeValueEnum", NOW(), NOW()),
  ('val-mech-isolation', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE'), 'ISOLATION'::"ExerciseAttributeValueEnum", NOW(), NOW())
ON CONFLICT ("attributeNameId", "value") DO NOTHING;


-- 3. ENSURE SEED EXERCISES EXIST
INSERT INTO "exercises" ("id", "name", "nameEn", "slug", "slugEn", "createdAt", "updatedAt")
VALUES
  ('ex-bench-press', 'Press de Banca', 'Barbell Bench Press', 'press-de-banca', 'barbell-bench-press', NOW() - INTERVAL '1 year', NOW()),
  ('ex-squat', 'Sentadilla con barra', 'Barbell Back Squat', 'sentadilla-con-barra', 'barbell-back-squat', NOW() - INTERVAL '1 year', NOW()),
  ('ex-lunge', 'Fentes arrières à la barre', 'Barbell Alternating Reverse Lunges', 'fentes-arrieres-barre', 'barbell-alternating-reverse-lunges', NOW() - INTERVAL '1 year', NOW()),
  ('ex-facepull', 'Tirage horizontal corde à la poulie haute', 'Facepulls', 'tirage-horizontal-corde-poulie-haute', 'facepulls', NOW() - INTERVAL '1 year', NOW()),
  ('ex-bench-hops', 'Sauts altérnés aux côtés du banc', 'Bench Hops', 'sauts-alternes-cotes-banc', 'bench-hops', NOW() - INTERVAL '1 year', NOW()),
  ('ex-bicep-curl', 'Curl de bíceps con mancuernas', 'Dumbbell Bicep Curl', 'curl-biceps-mancuernas', 'dumbbell-bicep-curl', NOW() - INTERVAL '1 year', NOW())
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "nameEn" = EXCLUDED."nameEn", "slugEn" = EXCLUDED."slugEn", "updatedAt" = NOW();


-- 4. LINK EXERCISES TO ATTRIBUTES (MUSCLES & EQUIPMENT)
-- Clean up existing attributes for our standard exercise IDs to prevent unique constraint violations on re-run
DELETE FROM "exercise_attributes" WHERE "exerciseId" IN ('ex-bench-press', 'ex-squat', 'ex-lunge', 'ex-facepull', 'ex-bench-hops', 'ex-bicep-curl');

INSERT INTO "exercise_attributes" ("id", "exerciseId", "attributeNameId", "attributeValueId", "createdAt", "updatedAt")
VALUES
  -- Bench Press (Chest, Barbell, Bench, Compound)
  ('ea-bp-type', 'ex-bench-press', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'STRENGTH' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE')), NOW(), NOW()),
  ('ea-bp-primary', 'ex-bench-press', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'CHEST' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE')), NOW(), NOW()),
  ('ea-bp-secondary1', 'ex-bench-press', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'TRICEPS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE')), NOW(), NOW()),
  ('ea-bp-secondary2', 'ex-bench-press', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'SHOULDERS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE')), NOW(), NOW()),
  ('ea-bp-equip1', 'ex-bench-press', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'BARBELL' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-bp-equip2', 'ex-bench-press', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'BENCH' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-bp-mech', 'ex-bench-press', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'COMPOUND' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE')), NOW(), NOW()),

  -- Squat (Quadriceps, Glutes, Barbell, Compound)
  ('ea-sq-type', 'ex-squat', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'STRENGTH' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE')), NOW(), NOW()),
  ('ea-sq-primary', 'ex-squat', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'QUADRICEPS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE')), NOW(), NOW()),
  ('ea-sq-secondary', 'ex-squat', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'GLUTES' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE')), NOW(), NOW()),
  ('ea-sq-equip', 'ex-squat', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'BARBELL' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-sq-mech', 'ex-squat', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'COMPOUND' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE')), NOW(), NOW()),

  -- Lunge (Quadriceps, Glutes, Hamstrings, Barbell, Bar, Compound)
  ('ea-lu-type', 'ex-lunge', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'STRENGTH' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE')), NOW(), NOW()),
  ('ea-lu-primary', 'ex-lunge', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'QUADRICEPS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE')), NOW(), NOW()),
  ('ea-lu-secondary1', 'ex-lunge', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'GLUTES' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE')), NOW(), NOW()),
  ('ea-lu-secondary2', 'ex-lunge', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'HAMSTRINGS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE')), NOW(), NOW()),
  ('ea-lu-equip1', 'ex-lunge', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'BARBELL' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-lu-equip2', 'ex-lunge', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'BAR' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-lu-mech', 'ex-lunge', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'COMPOUND' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE')), NOW(), NOW()),

  -- Facepull (Shoulders, Forearms, Cable, Rope, Isolation)
  ('ea-fp-type', 'ex-facepull', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'STRENGTH' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE')), NOW(), NOW()),
  ('ea-fp-primary', 'ex-facepull', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'SHOULDERS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE')), NOW(), NOW()),
  ('ea-fp-secondary', 'ex-facepull', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'FOREARMS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE')), NOW(), NOW()),
  ('ea-fp-equip1', 'ex-facepull', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'CABLE' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-fp-equip2', 'ex-facepull', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'ROPE' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-fp-mech', 'ex-facepull', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'ISOLATION' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE')), NOW(), NOW()),

  -- Bench Hops (Full body, Bench, Compound, Plyometrics/Crossfit/Cardio)
  ('ea-bh-type1', 'ex-bench-hops', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'PLYOMETRICS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE')), NOW(), NOW()),
  ('ea-bh-type2', 'ex-bench-hops', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'CROSSFIT' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE')), NOW(), NOW()),
  ('ea-bh-type3', 'ex-bench-hops', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'CARDIO' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE')), NOW(), NOW()),
  ('ea-bh-primary', 'ex-bench-hops', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'FULL_BODY' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE')), NOW(), NOW()),
  ('ea-bh-equip', 'ex-bench-hops', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'BENCH' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-bh-mech', 'ex-bench-hops', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'COMPOUND' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE')), NOW(), NOW()),

  -- Bicep Curl (Biceps, Forearms, Dumbbell, Isolation)
  ('ea-bc-type', 'ex-bicep-curl', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'STRENGTH' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'TYPE')), NOW(), NOW()),
  ('ea-bc-primary', 'ex-bicep-curl', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'BICEPS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'PRIMARY_MUSCLE')), NOW(), NOW()),
  ('ea-bc-secondary', 'ex-bicep-curl', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'FOREARMS' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'SECONDARY_MUSCLE')), NOW(), NOW()),
  ('ea-bc-equip', 'ex-bicep-curl', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'DUMBBELL' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'EQUIPMENT')), NOW(), NOW()),
  ('ea-bc-mech', 'ex-bicep-curl', (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE'), (SELECT "id" FROM "exercise_attribute_values" WHERE "value" = 'ISOLATION' AND "attributeNameId" = (SELECT "id" FROM "exercise_attribute_names" WHERE "name" = 'MECHANICS_TYPE')), NOW(), NOW())
ON CONFLICT ("exerciseId", "attributeNameId", "attributeValueId") DO NOTHING;


-- 5. GENERATE PROGRESSIVE SESSIONS FOR STATISTICS (4 WEEKS, 8 WEEKS, 12 WEEKS, 1 YEAR)
-- Running as a PL/pgSQL DO block for dynamic, progressive values stretching back 1 year.
DO $$
DECLARE
    user_id_var TEXT := 'TTEEJ9BP74nYMSa2YFEU6IbWbHTFfIBn';
    session_id_var TEXT;
    session_exercise_id_var TEXT;
    i INT;
    workout_date TIMESTAMP;
    bench_weight INT;
    squat_weight INT;
    curl_weight INT;
    reps_val INT;
    set_idx INT;
BEGIN
    -- Clear previous workouts for this user to avoid duplication/issues
    DELETE FROM "workout_sessions" WHERE "userId" = user_id_var;

    -- Loop over weeks (from 52 weeks ago up to today, representing 1 year of training)
    FOR i IN REVERSE 52..0 LOOP
        -- We will generate workouts for each week:
        -- - 3 workouts per week for the last 4 weeks (i = 4..0)
        -- - 2 workouts per week for weeks 5 to 12 (i = 12..5)
        -- - 1 workout every 2 weeks for weeks 13 to 52 (i = 52..13 where i % 2 = 0)
        
        IF (i <= 4) OR (i > 4 AND i <= 12) OR (i > 12 AND i % 2 = 0) THEN
            
            -- WORKOUT 1: MONDAY (Chest & Arms - Bench Press + Bicep Curls)
            workout_date := CURRENT_DATE - (i * INTERVAL '1 week') - INTERVAL '3 days' + TIME '10:00:00';
            
            -- Progressive strength curve:
            -- Bench Press: from 40kg (week 52) to 80kg (today)
            bench_weight := 40 + ROUND((52 - i)::numeric * 40.0 / 52.0 / 2.5) * 2.5;
            -- Bicep Curls: from 10kg (week 52) to 25kg (today)
            curl_weight := 10 + ROUND((52 - i)::numeric * 15.0 / 52.0 / 1.0) * 1.0;
            
            -- Create Workout Session
            session_id_var := 'sess-mon-' || i;
            INSERT INTO "workout_sessions" ("id", "userId", "startedAt", "endedAt", "duration", "muscles", "rating")
            VALUES (
                session_id_var, 
                user_id_var, 
                workout_date, 
                workout_date + INTERVAL '45 minutes', 
                2700, -- 45 minutes in seconds
                ARRAY['CHEST', 'TRICEPS', 'BICEPS']::"ExerciseAttributeValueEnum"[], 
                5
            );
            
            -- Add Bench Press to Session
            session_exercise_id_var := 'se-mon-bp-' || i;
            INSERT INTO "workout_session_exercises" ("id", "workoutSessionId", "exerciseId", "order")
            VALUES (session_exercise_id_var, session_id_var, 'ex-bench-press', 0);
            
            -- Add 4 sets of Bench Press with realistic reps (descending reps for heavier sets)
            FOR set_idx IN 0..3 LOOP
                reps_val := CASE WHEN set_idx = 3 THEN 6 ELSE 8 END;
                INSERT INTO "workout_sets" ("id", "workoutSessionExerciseId", "setIndex", "type", "types", "valuesInt", "valuesSec", "units", "completed")
                VALUES (
                    'set-mon-bp-' || i || '-' || set_idx,
                    session_exercise_id_var,
                    set_idx,
                    'WEIGHT'::"WorkoutSetType",
                    ARRAY['WEIGHT', 'REPS']::"WorkoutSetType"[],
                    ARRAY[bench_weight, reps_val]::INTEGER[],
                    ARRAY[]::INTEGER[],
                    ARRAY['kg']::"WorkoutSetUnit"[],
                    true
                );
            END LOOP;

            -- Add Bicep Curl to Session
            session_exercise_id_var := 'se-mon-bc-' || i;
            INSERT INTO "workout_session_exercises" ("id", "workoutSessionId", "exerciseId", "order")
            VALUES (session_exercise_id_var, session_id_var, 'ex-bicep-curl', 1);
            
            -- Add 3 sets of Bicep Curl
            FOR set_idx IN 0..2 LOOP
                INSERT INTO "workout_sets" ("id", "workoutSessionExerciseId", "setIndex", "type", "types", "valuesInt", "valuesSec", "units", "completed")
                VALUES (
                    'set-mon-bc-' || i || '-' || set_idx,
                    session_exercise_id_var,
                    set_idx,
                    'WEIGHT'::"WorkoutSetType",
                    ARRAY['WEIGHT', 'REPS']::"WorkoutSetType"[],
                    ARRAY[curl_weight, 10]::INTEGER[],
                    ARRAY[]::INTEGER[],
                    ARRAY['kg']::"WorkoutSetUnit"[],
                    true
                );
            END LOOP;
            
            
            -- WORKOUT 2: WEDNESDAY (Legs - Squats)
            -- Only active for the last 12 weeks to simulate structured program onboarding
            IF (i <= 12) THEN
                workout_date := CURRENT_DATE - (i * INTERVAL '1 week') - INTERVAL '1 day' + TIME '18:00:00';
                
                -- Progressive Squats: from 60kg (week 12) to 100kg (today)
                squat_weight := 60 + ROUND((12 - i)::numeric * 40.0 / 12.0 / 2.5) * 2.5;
                
                session_id_var := 'sess-wed-' || i;
                INSERT INTO "workout_sessions" ("id", "userId", "startedAt", "endedAt", "duration", "muscles", "rating")
                VALUES (
                    session_id_var, 
                    user_id_var, 
                    workout_date, 
                    workout_date + INTERVAL '50 minutes', 
                    3000, -- 50 mins
                    ARRAY['QUADRICEPS', 'GLUTES']::"ExerciseAttributeValueEnum"[], 
                    4
                );
                
                session_exercise_id_var := 'se-wed-sq-' || i;
                INSERT INTO "workout_session_exercises" ("id", "workoutSessionId", "exerciseId", "order")
                VALUES (session_exercise_id_var, session_id_var, 'ex-squat', 0);
                
                -- Add 4 sets of Squats
                FOR set_idx IN 0..3 LOOP
                    reps_val := CASE WHEN set_idx = 3 THEN 5 ELSE 8 END;
                    INSERT INTO "workout_sets" ("id", "workoutSessionExerciseId", "setIndex", "type", "types", "valuesInt", "valuesSec", "units", "completed")
                    VALUES (
                        'set-wed-sq-' || i || '-' || set_idx,
                        session_exercise_id_var,
                        set_idx,
                        'WEIGHT'::"WorkoutSetType",
                        ARRAY['WEIGHT', 'REPS']::"WorkoutSetType"[],
                        ARRAY[squat_weight, reps_val]::INTEGER[],
                        ARRAY[]::INTEGER[],
                        ARRAY['kg']::"WorkoutSetUnit"[],
                        true
                    );
                END LOOP;
            END IF;


            -- WORKOUT 3: FRIDAY (Full Body Conditioning - Lunge, Facepulls & Hops)
            -- Only active for the last 4 weeks to simulate an high-intensity phase
            IF (i <= 4) THEN
                workout_date := CURRENT_DATE - (i * INTERVAL '1 week') + TIME '15:00:00';
                
                session_id_var := 'sess-fri-' || i;
                INSERT INTO "workout_sessions" ("id", "userId", "startedAt", "endedAt", "duration", "muscles", "rating")
                VALUES (
                    session_id_var, 
                    user_id_var, 
                    workout_date, 
                    workout_date + INTERVAL '60 minutes', 
                    3600, -- 60 mins
                    ARRAY['QUADRICEPS', 'SHOULDERS', 'FULL_BODY']::"ExerciseAttributeValueEnum"[], 
                    5
                );
                
                -- Facepull
                session_exercise_id_var := 'se-fri-fp-' || i;
                INSERT INTO "workout_session_exercises" ("id", "workoutSessionId", "exerciseId", "order")
                VALUES (session_exercise_id_var, session_id_var, 'ex-facepull', 0);
                
                FOR set_idx IN 0..2 LOOP
                    INSERT INTO "workout_sets" ("id", "workoutSessionExerciseId", "setIndex", "type", "types", "valuesInt", "valuesSec", "units", "completed")
                    VALUES (
                        'set-fri-fp-' || i || '-' || set_idx,
                        session_exercise_id_var,
                        set_idx,
                        'WEIGHT'::"WorkoutSetType",
                        ARRAY['WEIGHT', 'REPS']::"WorkoutSetType"[],
                        ARRAY[20 + set_idx * 5, 12]::INTEGER[],
                        ARRAY[]::INTEGER[],
                        ARRAY['kg']::"WorkoutSetUnit"[],
                        true
                    );
                END LOOP;

                -- Lunge
                session_exercise_id_var := 'se-fri-lu-' || i;
                INSERT INTO "workout_session_exercises" ("id", "workoutSessionId", "exerciseId", "order")
                VALUES (session_exercise_id_var, session_id_var, 'ex-lunge', 1);
                
                FOR set_idx IN 0..2 LOOP
                    INSERT INTO "workout_sets" ("id", "workoutSessionExerciseId", "setIndex", "type", "types", "valuesInt", "valuesSec", "units", "completed")
                    VALUES (
                        'set-fri-lu-' || i || '-' || set_idx,
                        session_exercise_id_var,
                        set_idx,
                        'WEIGHT'::"WorkoutSetType",
                        ARRAY['WEIGHT', 'REPS']::"WorkoutSetType"[],
                        ARRAY[30 + set_idx * 10, 10]::INTEGER[],
                        ARRAY[]::INTEGER[],
                        ARRAY['kg']::"WorkoutSetUnit"[],
                        true
                    );
                END LOOP;
                
                -- Bench Hops (Bodyweight Cardio - reps only)
                session_exercise_id_var := 'se-fri-bh-' || i;
                INSERT INTO "workout_session_exercises" ("id", "workoutSessionId", "exerciseId", "order")
                VALUES (session_exercise_id_var, session_id_var, 'ex-bench-hops', 2);
                
                FOR set_idx IN 0..2 LOOP
                    INSERT INTO "workout_sets" ("id", "workoutSessionExerciseId", "setIndex", "type", "types", "valuesInt", "valuesSec", "units", "completed")
                    VALUES (
                        'set-fri-bh-' || i || '-' || set_idx,
                        session_exercise_id_var,
                        set_idx,
                        'REPS'::"WorkoutSetType",
                        ARRAY['REPS']::"WorkoutSetType"[],
                        ARRAY[20 + set_idx * 5]::INTEGER[],
                        ARRAY[]::INTEGER[],
                        ARRAY[]::"WorkoutSetUnit"[],
                        true
                    );
                END LOOP;
            END IF;

        END IF;
    END LOOP;
END $$;
