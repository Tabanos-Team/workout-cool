/**
 * ARCHIVO: src/entities/__tests__/entities-user-exercise.test.ts
 *
 * Tests unitarios para las entidades User y Exercise del schema Prisma.
 * Issue #30 — UT-entidades
 *
 * NO se conecta a la base de datos. Se prueba lógica de negocio pura:
 * validaciones, transformaciones y reglas derivadas del schema.
 *
 * Ejecutar: pnpm vitest run src/entities/__tests__/entities-user-exercise.test.ts
 */

import { describe, it, expect } from "vitest";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS — mirror del schema Prisma (sin importar @prisma/client para no necesitar DB)
// ═══════════════════════════════════════════════════════════════════════════════

type UserRole = "admin" | "user";
type SubscriptionStatus = "ACTIVE" | "TRIAL" | "CANCELLED" | "EXPIRED" | "PAUSED";
type Platform = "WEB" | "IOS" | "ANDROID";

type ExerciseAttributeNameEnum =
  | "TYPE" | "PRIMARY_MUSCLE" | "SECONDARY_MUSCLE" | "EQUIPMENT" | "MECHANICS_TYPE";

type ExerciseAttributeValueEnum =
  | "BODYWEIGHT" | "STRENGTH" | "CARDIO" | "POWERLIFTING" | "STRETCHING"
  | "BICEPS" | "SHOULDERS" | "CHEST" | "BACK" | "GLUTES" | "TRICEPS"
  | "HAMSTRINGS" | "QUADRICEPS" | "CALVES" | "ABDOMINALS" | "FULL_BODY"
  | "DUMBBELL" | "BARBELL" | "KETTLEBELLS" | "BODY_ONLY" | "NONE" | "MACHINE"
  | "ISOLATION" | "COMPOUND";

type WorkoutSetType = "TIME" | "WEIGHT" | "REPS" | "BODYWEIGHT" | "NA";
type WorkoutSetUnit = "kg" | "lbs";

// ─── Interfaces del dominio ───────────────────────────────────────────────────

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  locale?: string | null;
  role?: UserRole | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  isPremium?: boolean | null;
}

interface UserSubscription {
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | null;
  cancelledAt?: Date | null;
  platform?: Platform | null;
}

interface ExerciseData {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  fullVideoUrl?: string | null;
  slug?: string | null;
  slugEn?: string | null;
}

interface ExerciseAttribute {
  attributeName: ExerciseAttributeNameEnum;
  attributeValue: ExerciseAttributeValueEnum;
}

interface WorkoutSetData {
  type: WorkoutSetType;
  valuesInt: number[];
  valuesSec: number[];
  units: WorkoutSetUnit[];
  completed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE USUARIO — lógica de negocio pura derivada del schema
// ═══════════════════════════════════════════════════════════════════════════════

function isProfileComplete(user: Partial<UserProfile>): boolean {
  return !!(
    user.name?.trim() &&
    user.email?.trim() &&
    user.emailVerified === true &&
    user.image
  );
}

function getFullName(user: Pick<UserProfile, "firstName" | "lastName" | "name">): string {
  const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return full.length > 0 ? full : user.name;
}

function getUserInitials(user: Pick<UserProfile, "firstName" | "lastName" | "name">): string {
  if (user.firstName?.trim() && user.lastName?.trim()) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  const parts = user.name?.trim().split(" ") ?? [];
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length > 0) return parts[0][0].toUpperCase();
  return "?";
}

function isAdmin(user: Pick<UserProfile, "role">): boolean {
  return user.role === "admin";
}

function isUserBanned(user: Pick<UserProfile, "banned" | "banExpires">): boolean {
  if (!user.banned) return false;
  if (!user.banExpires) return true;
  return new Date() < new Date(user.banExpires);
}

function hasActivePremium(
  user: Pick<UserProfile, "isPremium">,
  subscriptions: UserSubscription[] = []
): boolean {
  if (user.isPremium === true) return true;
  const now = new Date();
  return subscriptions.some(
    (sub) =>
      (sub.status === "ACTIVE" || sub.status === "TRIAL") &&
      (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > now)
  );
}

function getUserLocale(user: Pick<UserProfile, "locale">, fallback = "fr"): string {
  return user.locale ?? fallback;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE EJERCICIO — lógica de negocio pura derivada del schema
// ═══════════════════════════════════════════════════════════════════════════════

function isExerciseComplete(exercise: ExerciseData): boolean {
  return !!(
    exercise.name?.trim() &&
    exercise.slug?.trim() &&
    exercise.description?.trim()
  );
}

function hasVideoContent(exercise: ExerciseData): boolean {
  return !!(exercise.fullVideoUrl?.trim());
}

function getBilingual(name: string | null | undefined, nameEn: string | null | undefined): string {
  return nameEn?.trim() || name?.trim() || "";
}

function getExerciseAttributesByType(
  attributes: ExerciseAttribute[],
  type: ExerciseAttributeNameEnum
): ExerciseAttributeValueEnum[] {
  return attributes.filter((a) => a.attributeName === type).map((a) => a.attributeValue);
}

function isPrimaryMusclePresent(attributes: ExerciseAttribute[]): boolean {
  return attributes.some((a) => a.attributeName === "PRIMARY_MUSCLE");
}

function isExerciseTypePresent(attributes: ExerciseAttribute[]): boolean {
  return attributes.some((a) => a.attributeName === "TYPE");
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE WORKOUT SET — derivados del schema WorkoutSet
// ═══════════════════════════════════════════════════════════════════════════════

function isSetComplete(set: WorkoutSetData): boolean {
  return set.completed === true;
}

function getSetDisplayValue(set: WorkoutSetData): string {
  if (set.type === "REPS" && set.valuesInt.length > 0) {
    const unit = set.units[0] ?? "";
    return `${set.valuesInt[0]} reps ${unit ? `@ ${set.valuesInt[1] ?? 0}${unit}` : ""}`.trim();
  }
  if (set.type === "TIME" && set.valuesSec.length > 0) {
    return `${set.valuesSec[0]}s`;
  }
  return "N/A";
}

function calculateTotalWorkoutDuration(sets: { valuesSec: number[] }[]): number {
  return sets.reduce((total, set) => total + (set.valuesSec[0] ?? 0), 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ████  TESTS — ENTIDAD USER  ████
// ═══════════════════════════════════════════════════════════════════════════════

describe("Entidad User — isProfileComplete", () => {

  const completeUser: UserProfile = {
    id: "usr_1",
    firstName: "Oscar",
    lastName: "Chilo",
    name: "Oscar Chilo",
    email: "oscar@example.com",
    emailVerified: true,
    image: "https://cdn.example.com/avatar.png",
    locale: "es",
  };

  it("debe retornar true para un usuario con todos los campos completos", () => {
    expect(isProfileComplete(completeUser)).toBe(true);
  });

  it("debe retornar false si falta el email", () => {
    expect(isProfileComplete({ ...completeUser, email: "" })).toBe(false);
  });

  it("debe retornar false si emailVerified es false", () => {
    expect(isProfileComplete({ ...completeUser, emailVerified: false })).toBe(false);
  });

  it("debe retornar false si falta la imagen", () => {
    expect(isProfileComplete({ ...completeUser, image: null })).toBe(false);
    expect(isProfileComplete({ ...completeUser, image: undefined })).toBe(false);
  });

  it("debe retornar false si name está vacío", () => {
    expect(isProfileComplete({ ...completeUser, name: "" })).toBe(false);
  });

  it("debe retornar false si name es solo espacios", () => {
    expect(isProfileComplete({ ...completeUser, name: "   " })).toBe(false);
  });

  it("debe retornar false para un usuario vacío", () => {
    expect(isProfileComplete({})).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — getFullName", () => {

  it("debe retornar firstName + lastName cuando ambos están definidos", () => {
    expect(getFullName({ firstName: "Oscar", lastName: "Chilo", name: "OC" })).toBe("Oscar Chilo");
  });

  it("debe retornar name cuando firstName y lastName están vacíos", () => {
    expect(getFullName({ firstName: "", lastName: "", name: "Oscar Chilo" })).toBe("Oscar Chilo");
  });

  it("debe retornar solo firstName si lastName está vacío", () => {
    expect(getFullName({ firstName: "Oscar", lastName: "", name: "Oscar" })).toBe("Oscar");
  });

  it("debe retornar name como fallback si firstName y lastName son solo espacios", () => {
    expect(getFullName({ firstName: "  ", lastName: "  ", name: "Fallback" })).toBe("Fallback");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — getUserInitials", () => {

  it("debe retornar iniciales de firstName y lastName (mayúsculas)", () => {
    expect(getUserInitials({ firstName: "Oscar", lastName: "Chilo", name: "" })).toBe("OC");
  });

  it("debe retornar iniciales desde name cuando no hay firstName/lastName", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "Oscar Chilo" })).toBe("OC");
  });

  it("debe retornar primera letra del name si es una sola palabra", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "Oscar" })).toBe("O");
  });

  it("debe retornar '?' para nombre vacío", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "" })).toBe("?");
  });

  it("las iniciales deben estar en mayúsculas", () => {
    const initials = getUserInitials({ firstName: "oscar", lastName: "chilo", name: "" });
    expect(initials).toBe(initials.toUpperCase());
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — isAdmin", () => {

  it("debe retornar true si role es 'admin'", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
  });

  it("debe retornar false si role es 'user'", () => {
    expect(isAdmin({ role: "user" })).toBe(false);
  });

  it("debe retornar false si role es null", () => {
    expect(isAdmin({ role: null })).toBe(false);
  });

  it("debe retornar false si role es undefined", () => {
    expect(isAdmin({ role: undefined })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — isUserBanned", () => {

  it("debe retornar false si banned es false", () => {
    expect(isUserBanned({ banned: false, banExpires: null })).toBe(false);
  });

  it("debe retornar true si banned es true y no hay fecha de expiración (ban permanente)", () => {
    expect(isUserBanned({ banned: true, banExpires: null })).toBe(true);
  });

  it("debe retornar true si banned y banExpires es una fecha futura", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // mañana
    expect(isUserBanned({ banned: true, banExpires: futureDate })).toBe(true);
  });

  it("debe retornar false si banned y banExpires ya pasó (ban expirado)", () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60); // hace 1 hora
    expect(isUserBanned({ banned: true, banExpires: pastDate })).toBe(false);
  });

  it("debe retornar false si banned es null", () => {
    expect(isUserBanned({ banned: null, banExpires: null })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — hasActivePremium", () => {

  it("debe retornar true si isPremium es true (sin suscripciones)", () => {
    expect(hasActivePremium({ isPremium: true })).toBe(true);
  });

  it("debe retornar false si isPremium es false y no hay suscripciones", () => {
    expect(hasActivePremium({ isPremium: false }, [])).toBe(false);
  });

  it("debe retornar true si tiene suscripción ACTIVE vigente", () => {
    const sub: UserSubscription = {
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 días
    };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(true);
  });

  it("debe retornar true si tiene suscripción TRIAL vigente", () => {
    const sub: UserSubscription = {
      status: "TRIAL",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 días
    };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(true);
  });

  it("debe retornar false si la suscripción está CANCELLED", () => {
    const sub: UserSubscription = {
      status: "CANCELLED",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60),
    };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(false);
  });

  it("debe retornar false si la suscripción ACTIVE ya expiró (currentPeriodEnd pasado)", () => {
    const sub: UserSubscription = {
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() - 1000 * 60 * 60), // hace 1 hora
    };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(false);
  });

  it("debe retornar false si la suscripción está EXPIRED", () => {
    const sub: UserSubscription = { status: "EXPIRED" };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — getUserLocale", () => {

  it("debe retornar el locale del usuario si está definido", () => {
    expect(getUserLocale({ locale: "es" })).toBe("es");
  });

  it("debe retornar el fallback 'fr' si locale es null", () => {
    expect(getUserLocale({ locale: null })).toBe("fr");
  });

  it("debe retornar el fallback personalizado si locale es null", () => {
    expect(getUserLocale({ locale: null }, "en")).toBe("en");
  });

  it("debe soportar los locales del proyecto", () => {
    const supportedLocales = ["fr", "en", "es", "pt", "ru", "zh-CN", "de", "ja", "ko"];
    supportedLocales.forEach((loc) => {
      expect(getUserLocale({ locale: loc })).toBe(loc);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — isValidEmail", () => {

  it("debe validar email correcto", () => {
    expect(isValidEmail("oscar@example.com")).toBe(true);
  });

  it("debe rechazar email sin @", () => {
    expect(isValidEmail("oscarexample.com")).toBe(false);
  });

  it("debe rechazar email sin dominio", () => {
    expect(isValidEmail("oscar@")).toBe(false);
  });

  it("debe rechazar email vacío", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("debe aceptar email con subdominios", () => {
    expect(isValidEmail("user@mail.test.com")).toBe(true);
  });

  it("debe rechazar email con espacios", () => {
    expect(isValidEmail("os car@example.com")).toBe(false);
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// ████  TESTS — ENTIDAD EXERCISE  ████
// ═══════════════════════════════════════════════════════════════════════════════

describe("Entidad Exercise — isExerciseComplete", () => {

  const completeExercise: ExerciseData = {
    id: "ex_1",
    name: "Barbell Squat",
    nameEn: "Barbell Squat",
    description: "<p>Stand with feet shoulder-width apart...</p>",
    descriptionEn: "<p>Stand with feet shoulder-width apart...</p>",
    fullVideoUrl: "https://youtube.com/watch?v=xyz",
    slug: "barbell-squat-fr",
    slugEn: "barbell-squat",
  };

  it("debe retornar true para ejercicio con todos los campos", () => {
    expect(isExerciseComplete(completeExercise)).toBe(true);
  });

  it("debe retornar false si falta el name", () => {
    expect(isExerciseComplete({ ...completeExercise, name: "" })).toBe(false);
  });

  it("debe retornar false si falta el slug", () => {
    expect(isExerciseComplete({ ...completeExercise, slug: null })).toBe(false);
  });

  it("debe retornar false si falta la description", () => {
    expect(isExerciseComplete({ ...completeExercise, description: null })).toBe(false);
  });

  it("debe retornar false si description es string vacío", () => {
    expect(isExerciseComplete({ ...completeExercise, description: "   " })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — hasVideoContent", () => {

  it("debe retornar true si fullVideoUrl está definida", () => {
    expect(hasVideoContent({ id: "1", name: "Squat", fullVideoUrl: "https://youtube.com/xyz" })).toBe(true);
  });

  it("debe retornar false si fullVideoUrl es null", () => {
    expect(hasVideoContent({ id: "1", name: "Squat", fullVideoUrl: null })).toBe(false);
  });

  it("debe retornar false si fullVideoUrl es string vacío", () => {
    expect(hasVideoContent({ id: "1", name: "Squat", fullVideoUrl: "" })).toBe(false);
  });

  it("debe retornar false si fullVideoUrl no está definida", () => {
    expect(hasVideoContent({ id: "1", name: "Squat" })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — getBilingual (nameEn / name)", () => {

  it("debe preferir nameEn cuando está disponible", () => {
    expect(getBilingual("Sentadilla", "Barbell Squat")).toBe("Barbell Squat");
  });

  it("debe usar name si nameEn es null", () => {
    expect(getBilingual("Sentadilla", null)).toBe("Sentadilla");
  });

  it("debe usar name si nameEn es undefined", () => {
    expect(getBilingual("Sentadilla", undefined)).toBe("Sentadilla");
  });

  it("debe retornar string vacío si ambos son null", () => {
    expect(getBilingual(null, null)).toBe("");
  });

  it("debe usar name si nameEn es string vacío", () => {
    expect(getBilingual("Sentadilla", "")).toBe("Sentadilla");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — getExerciseAttributesByType", () => {

  const attributes: ExerciseAttribute[] = [
    { attributeName: "TYPE", attributeValue: "STRENGTH" },
    { attributeName: "PRIMARY_MUSCLE", attributeValue: "QUADRICEPS" },
    { attributeName: "SECONDARY_MUSCLE", attributeValue: "GLUTES" },
    { attributeName: "EQUIPMENT", attributeValue: "BARBELL" },
    { attributeName: "MECHANICS_TYPE", attributeValue: "COMPOUND" },
  ];

  it("debe filtrar atributos correctamente por TYPE", () => {
    const types = getExerciseAttributesByType(attributes, "TYPE");
    expect(types).toEqual(["STRENGTH"]);
  });

  it("debe filtrar PRIMARY_MUSCLE correctamente", () => {
    const muscles = getExerciseAttributesByType(attributes, "PRIMARY_MUSCLE");
    expect(muscles).toEqual(["QUADRICEPS"]);
  });

  it("debe retornar arreglo vacío si no hay atributos del tipo solicitado", () => {
    const result = getExerciseAttributesByType([], "TYPE");
    expect(result).toEqual([]);
  });

  it("debe soportar múltiples valores del mismo tipo", () => {
    const multiAttrs: ExerciseAttribute[] = [
      { attributeName: "SECONDARY_MUSCLE", attributeValue: "GLUTES" },
      { attributeName: "SECONDARY_MUSCLE", attributeValue: "HAMSTRINGS" },
    ];
    const result = getExerciseAttributesByType(multiAttrs, "SECONDARY_MUSCLE");
    expect(result).toHaveLength(2);
    expect(result).toContain("GLUTES");
    expect(result).toContain("HAMSTRINGS");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — isPrimaryMusclePresent", () => {

  it("debe retornar true si hay atributo PRIMARY_MUSCLE", () => {
    const attrs: ExerciseAttribute[] = [
      { attributeName: "PRIMARY_MUSCLE", attributeValue: "CHEST" },
    ];
    expect(isPrimaryMusclePresent(attrs)).toBe(true);
  });

  it("debe retornar false si no hay atributo PRIMARY_MUSCLE", () => {
    const attrs: ExerciseAttribute[] = [
      { attributeName: "TYPE", attributeValue: "STRENGTH" },
    ];
    expect(isPrimaryMusclePresent(attrs)).toBe(false);
  });

  it("debe retornar false para atributos vacíos", () => {
    expect(isPrimaryMusclePresent([])).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — generateSlug", () => {

  it("debe convertir nombre a slug en minúsculas con guiones", () => {
    expect(generateSlug("Barbell Squat")).toBe("barbell-squat");
  });

  it("debe eliminar caracteres especiales", () => {
    expect(generateSlug("Bench Press (Flat)")).toBe("bench-press-flat");
  });

  it("debe eliminar múltiples espacios consecutivos", () => {
    expect(generateSlug("Pull  Up")).toBe("pull-up");
  });

  it("debe funcionar con nombre en español", () => {
    expect(generateSlug("Sentadilla con barra")).toBe("sentadilla-con-barra");
  });

  it("el slug no debe contener espacios", () => {
    const slug = generateSlug("Dumbbell Curl");
    expect(slug).not.toContain(" ");
  });

  it("el slug debe estar en minúsculas", () => {
    const slug = generateSlug("PUSH UP");
    expect(slug).toBe(slug.toLowerCase());
  });

  it("slug vacío para nombre vacío", () => {
    expect(generateSlug("")).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — isExerciseTypePresent", () => {

  it("debe retornar true si hay atributo TYPE", () => {
    expect(isExerciseTypePresent([{ attributeName: "TYPE", attributeValue: "CARDIO" }])).toBe(true);
  });

  it("debe retornar false si no hay atributo TYPE", () => {
    expect(isExerciseTypePresent([{ attributeName: "EQUIPMENT", attributeValue: "BARBELL" }])).toBe(false);
  });

  it("los tipos válidos del schema deben ser aceptados", () => {
    const validTypes: ExerciseAttributeValueEnum[] = [
      "BODYWEIGHT", "STRENGTH", "CARDIO", "POWERLIFTING", "STRETCHING",
    ];
    validTypes.forEach((val) => {
      expect(isExerciseTypePresent([{ attributeName: "TYPE", attributeValue: val }])).toBe(true);
    });
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// ████  TESTS — WORKOUT SET (relacionado con Exercise en WorkoutSession)  ████
// ═══════════════════════════════════════════════════════════════════════════════

describe("WorkoutSet — isSetComplete", () => {

  it("debe retornar true si completed es true", () => {
    const set: WorkoutSetData = { type: "REPS", valuesInt: [10], valuesSec: [], units: ["kg"], completed: true };
    expect(isSetComplete(set)).toBe(true);
  });

  it("debe retornar false si completed es false", () => {
    const set: WorkoutSetData = { type: "REPS", valuesInt: [10], valuesSec: [], units: ["kg"], completed: false };
    expect(isSetComplete(set)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("WorkoutSet — getSetDisplayValue", () => {

  it("debe mostrar reps con unidad para tipo REPS con kg", () => {
    const set: WorkoutSetData = { type: "REPS", valuesInt: [10, 80], valuesSec: [], units: ["kg"], completed: false };
    const display = getSetDisplayValue(set);
    expect(display).toContain("10");
    expect(display).toContain("reps");
  });

  it("debe mostrar segundos para tipo TIME", () => {
    const set: WorkoutSetData = { type: "TIME", valuesInt: [], valuesSec: [30], units: [], completed: false };
    expect(getSetDisplayValue(set)).toBe("30s");
  });

  it("debe retornar N/A para tipo desconocido o sin valores", () => {
    const set: WorkoutSetData = { type: "BODYWEIGHT", valuesInt: [], valuesSec: [], units: [], completed: false };
    expect(getSetDisplayValue(set)).toBe("N/A");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("WorkoutSet — calculateTotalWorkoutDuration", () => {

  it("debe sumar la duración total de todos los sets (en segundos)", () => {
    const sets = [{ valuesSec: [30] }, { valuesSec: [45] }, { valuesSec: [60] }];
    expect(calculateTotalWorkoutDuration(sets)).toBe(135);
  });

  it("debe retornar 0 para una sesión sin sets", () => {
    expect(calculateTotalWorkoutDuration([])).toBe(0);
  });

  it("debe retornar 0 si los sets no tienen valuesSec", () => {
    const sets = [{ valuesSec: [] }, { valuesSec: [] }];
    expect(calculateTotalWorkoutDuration(sets)).toBe(0);
  });

  it("debe manejar un solo set correctamente", () => {
    expect(calculateTotalWorkoutDuration([{ valuesSec: [120] }])).toBe(120);
  });
});