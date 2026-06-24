export type ExerciseAttributeNameEnum =
  | "TYPE" | "PRIMARY_MUSCLE" | "SECONDARY_MUSCLE" | "EQUIPMENT" | "MECHANICS_TYPE";

export type ExerciseAttributeValueEnum =
  | "BODYWEIGHT" | "STRENGTH" | "CARDIO" | "POWERLIFTING" | "STRETCHING"
  | "BICEPS" | "SHOULDERS" | "CHEST" | "BACK" | "GLUTES" | "TRICEPS"
  | "HAMSTRINGS" | "QUADRICEPS" | "CALVES" | "ABDOMINALS" | "FULL_BODY"
  | "DUMBBELL" | "BARBELL" | "KETTLEBELLS" | "BODY_ONLY" | "NONE" | "MACHINE"
  | "ISOLATION" | "COMPOUND";

export type WorkoutSetType = "TIME" | "WEIGHT" | "REPS" | "BODYWEIGHT" | "NA";
export type WorkoutSetUnit = "kg" | "lbs";

export interface ExerciseData {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  fullVideoUrl?: string | null;
  slug?: string | null;
  slugEn?: string | null;
}

export interface ExerciseAttribute {
  attributeName: ExerciseAttributeNameEnum;
  attributeValue: ExerciseAttributeValueEnum;
}

export interface WorkoutSetData {
  type: WorkoutSetType;
  valuesInt: number[];
  valuesSec: number[];
  units: WorkoutSetUnit[];
  completed: boolean;
}

export function isExerciseComplete(exercise: ExerciseData): boolean {
  return !!(
    exercise.name?.trim() &&
    exercise.slug?.trim() &&
    exercise.description?.trim()
  );
}

export function hasVideoContent(exercise: ExerciseData): boolean {
  return !!(exercise.fullVideoUrl?.trim());
}

export function getBilingual(name: string | null | undefined, nameEn: string | null | undefined): string {
  return nameEn?.trim() || name?.trim() || "";
}

export function getExerciseAttributesByType(
  attributes: ExerciseAttribute[],
  type: ExerciseAttributeNameEnum
): ExerciseAttributeValueEnum[] {
  return attributes.filter((a) => a.attributeName === type).map((a) => a.attributeValue);
}

export function isPrimaryMusclePresent(attributes: ExerciseAttribute[]): boolean {
  return attributes.some((a) => a.attributeName === "PRIMARY_MUSCLE");
}

export function isExerciseTypePresent(attributes: ExerciseAttribute[]): boolean {
  return attributes.some((a) => a.attributeName === "TYPE");
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function isSetComplete(set: WorkoutSetData): boolean {
  return set.completed === true;
}

export function getSetDisplayValue(set: WorkoutSetData): string {
  if (set.type === "REPS" && set.valuesInt.length > 0) {
    const unit = set.units[0] ?? "";
    return `${set.valuesInt[0]} reps ${unit ? `@ ${set.valuesInt[1] ?? 0}${unit}` : ""}`.trim();
  }
  if (set.type === "TIME" && set.valuesSec.length > 0) {
    return `${set.valuesSec[0]}s`;
  }
  return "N/A";
}

export function calculateTotalWorkoutDuration(sets: { valuesSec: number[] }[]): number {
  return sets.reduce((total, set) => total + (set.valuesSec[0] ?? 0), 0);
}
