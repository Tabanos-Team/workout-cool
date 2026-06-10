/**
 * ARCHIVO: src/entities/__tests__/entities-user-exercise.test.ts
 *
 * Tests unitarios para las entidades User y Exercise utilizando técnicas de caja negra:
 * - Partición de Equivalencia (PE)
 * - Análisis de Valores Límite (AVL)
 * - Tablas de Decisión (TD)
 *
 * NO se conecta a la base de datos. Se prueba la lógica pura importada de producción.
 *
 * Ejecutar: pnpm vitest run src/entities/__tests__/entities-user-exercise.test.ts
 */

import { describe, it, expect } from "vitest";

// Importaciones de tipos y lógica de negocio reales
import {
  isProfileComplete,
  getFullName,
  getUserInitials,
  isAdmin,
  isUserBanned,
  hasActivePremium,
  getUserLocale,
  isValidEmail,
  type UserProfile,
  type UserSubscription
} from "../user/lib/user-logic";

import {
  isExerciseComplete,
  hasVideoContent,
  getBilingual,
  isPrimaryMusclePresent,
  isExerciseTypePresent,
  generateSlug,
  isSetComplete,
  getSetDisplayValue,
  calculateTotalWorkoutDuration,
  type WorkoutSetData,
  type ExerciseData,
  type ExerciseAttribute
} from "../exercise/lib/exercise-logic";

// ═══════════════════════════════════════════════════════════════════════════════
// ████  TESTS — ENTIDAD USER  ████
// ═══════════════════════════════════════════════════════════════════════════════

describe("Entidad User — isProfileComplete (Partición de Equivalencia - PE)", () => {
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

  it("[PE - Clase Válida] debe retornar true para un usuario con todos los campos completos", () => {
    expect(isProfileComplete(completeUser)).toBe(true);
  });

  it("[PE - Clase Inválida] debe retornar false si falta el email", () => {
    expect(isProfileComplete({ ...completeUser, email: "" })).toBe(false);
  });

  it("[PE - Clase Inválida] debe retornar false si emailVerified es false", () => {
    expect(isProfileComplete({ ...completeUser, emailVerified: false })).toBe(false);
  });

  it("[PE - Clase Inválida] debe retornar false si falta la imagen", () => {
    expect(isProfileComplete({ ...completeUser, image: null })).toBe(false);
  });

  it("[PE - Clase Inválida] debe retornar false si name está vacío o solo espacios", () => {
    expect(isProfileComplete({ ...completeUser, name: "   " })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — getFullName (PE)", () => {
  it("[PE - Clase Válida] debe combinar firstName y lastName", () => {
    expect(getFullName({ firstName: "Oscar", lastName: "Chilo", name: "OC" })).toBe("Oscar Chilo");
  });

  it("[PE - Fallback] debe usar name si firstName o lastName están vacíos", () => {
    expect(getFullName({ firstName: "", lastName: "", name: "Oscar Chilo" })).toBe("Oscar Chilo");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — getUserInitials (PE & AVL)", () => {
  it("[PE/AVL - Límite 2 car.] debe retornar iniciales de firstName y lastName", () => {
    expect(getUserInitials({ firstName: "Oscar", lastName: "Chilo", name: "OC" })).toBe("OC");
  });

  it("[PE] debe retornar iniciales desde el name completo (primer y último nombre)", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "Oscar Carlos Chilo" })).toBe("OC");
  });

  it("[AVL - Límite 1 car.] debe retornar la primera letra del name si es una sola palabra", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "Oscar" })).toBe("O");
  });

  it("[PE - Clase Inválida] debe retornar '?' para nombre vacío o no definido", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "" })).toBe("?");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — isAdmin (PE)", () => {
  it("[PE] debe retornar true si el rol es admin", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
  });

  it("[PE] debe retornar false para otros roles", () => {
    expect(isAdmin({ role: "user" })).toBe(false);
    expect(isAdmin({ role: null })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — isUserBanned (Análisis de Valores Límite - AVL)", () => {
  it("[PE - No Baneado] debe retornar false si banned es false", () => {
    expect(isUserBanned({ banned: false, banExpires: null })).toBe(false);
  });

  it("[AVL - Ban Permanente] debe retornar true si banned es true y banExpires es null", () => {
    expect(isUserBanned({ banned: true, banExpires: null })).toBe(true);
  });

  it("[AVL - Expiración Futura] debe retornar true si banned es true y la fecha es futura", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // Mañana
    expect(isUserBanned({ banned: true, banExpires: futureDate })).toBe(true);
  });

  it("[AVL - Expiración Pasada] debe retornar false si banned es true pero la fecha ya expiró", () => {
    const pastDate = new Date(Date.now() - 1000); // Hace 1 segundo
    expect(isUserBanned({ banned: true, banExpires: pastDate })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — hasActivePremium (Tabla de Decisión - TD)", () => {
  it("[TD - Regla 1] debe retornar true si isPremium es true directamente", () => {
    expect(hasActivePremium({ isPremium: true }, [])).toBe(true);
  });

  it("[TD - Regla 2] debe retornar true con suscripción activa y vigente", () => {
    const sub: UserSubscription = {
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 días
    };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(true);
  });

  it("[TD - Regla 3] debe retornar false si la suscripción active expiró", () => {
    const sub: UserSubscription = {
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() - 1000 * 60 * 60), // hace 1 hora
    };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(false);
  });

  it("[TD - Regla 4] debe retornar false si la suscripción está cancelada o expirada", () => {
    const sub: UserSubscription = { status: "EXPIRED" };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — getUserLocale (PE)", () => {
  it("[PE] debe retornar el locale definido o el fallback", () => {
    expect(getUserLocale({ locale: "es" })).toBe("es");
    expect(getUserLocale({ locale: null }, "en")).toBe("en");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad User — isValidEmail (PE & AVL)", () => {
  it("[PE - Válido] debe retornar true para correos sintácticamente correctos", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("u@e.co")).toBe(true);
  });

  it("[PE - Inválido] debe retornar false para formatos de correo incorrectos o vacíos", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("userexample.com")).toBe(false);
    expect(isValidEmail("user@example")).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ████  TESTS — ENTIDAD EXERCISE  ████
// ═══════════════════════════════════════════════════════════════════════════════

describe("Entidad Exercise — isExerciseComplete (PE)", () => {
  const completeEx: ExerciseData = {
    id: "ex_1",
    name: "Squat",
    slug: "squat",
    description: "Squat exercise description",
  };

  it("[PE - Válido] debe retornar true si tiene name, slug y description", () => {
    expect(isExerciseComplete(completeEx)).toBe(true);
  });

  it("[PE - Inválido] debe retornar false si falta algún campo obligatorio", () => {
    expect(isExerciseComplete({ ...completeEx, name: "" })).toBe(false);
    expect(isExerciseComplete({ ...completeEx, slug: null })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — hasVideoContent (PE)", () => {
  it("[PE] debe retornar true si contiene video URL válido", () => {
    expect(hasVideoContent({ id: "1", name: "Squat", fullVideoUrl: "https://youtube.com/watch?v=1" })).toBe(true);
  });

  it("[PE] debe retornar false si no tiene video URL", () => {
    expect(hasVideoContent({ id: "1", name: "Squat", fullVideoUrl: "" })).toBe(false);
    expect(hasVideoContent({ id: "1", name: "Squat", fullVideoUrl: null })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — getBilingual (PE)", () => {
  it("[PE] debe retornar nameEn si está disponible, si no, name", () => {
    expect(getBilingual("Sentadilla", "Squat")).toBe("Squat");
    expect(getBilingual("Sentadilla", null)).toBe("Sentadilla");
    expect(getBilingual("Sentadilla", "")).toBe("Sentadilla");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — isPrimaryMusclePresent & isExerciseTypePresent (PE)", () => {
  const attrs: ExerciseAttribute[] = [
    { attributeName: "PRIMARY_MUSCLE", attributeValue: "QUADRICEPS" },
    { attributeName: "TYPE", attributeValue: "STRENGTH" },
  ];

  it("[PE] debe detectar presencia del músculo principal", () => {
    expect(isPrimaryMusclePresent(attrs)).toBe(true);
    expect(isPrimaryMusclePresent([])).toBe(false);
  });

  it("[PE] debe detectar presencia del tipo de ejercicio", () => {
    expect(isExerciseTypePresent(attrs)).toBe(true);
    expect(isExerciseTypePresent([])).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Entidad Exercise — generateSlug (PE & AVL)", () => {
  it("[PE - Clase Válida] debe convertir nombre a slug en minúsculas con guiones", () => {
    expect(generateSlug("Barbell Squat")).toBe("barbell-squat");
  });

  it("[PE - Especiales] debe limpiar caracteres no alfanuméricos", () => {
    expect(generateSlug("Bench Press (Flat)")).toBe("bench-press-flat");
  });

  it("[PE - Espacios] debe contraer múltiples espacios consecutivos en un solo guión", () => {
    expect(generateSlug("Pull  Up")).toBe("pull-up");
  });

  it("[AVL - Límite Inferior] debe retornar slug vacío para nombre vacío", () => {
    expect(generateSlug("")).toBe("");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ████  TESTS — WORKOUT SET  ████
// ═══════════════════════════════════════════════════════════════════════════════

describe("WorkoutSet — isSetComplete (PE)", () => {
  it("[PE] debe retornar el estado completed de la serie", () => {
    expect(isSetComplete({ type: "REPS", valuesInt: [], valuesSec: [], units: [], completed: true })).toBe(true);
    expect(isSetComplete({ type: "REPS", valuesInt: [], valuesSec: [], units: [], completed: false })).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("WorkoutSet — getSetDisplayValue (Tabla de Decisión - TD)", () => {
  it("[TD - Regla 1] debe formatear reps con peso y unidad para tipo REPS", () => {
    const set: WorkoutSetData = { type: "REPS", valuesInt: [10, 80], valuesSec: [], units: ["kg"], completed: false };
    expect(getSetDisplayValue(set)).toBe("10 reps @ 80kg");
  });

  it("[TD - Regla 2] debe mostrar duración en segundos para tipo TIME", () => {
    const set: WorkoutSetData = { type: "TIME", valuesInt: [], valuesSec: [30], units: [], completed: false };
    expect(getSetDisplayValue(set)).toBe("30s");
  });

  it("[TD - Regla 3] debe retornar N/A para tipo sin soporte o sin valores", () => {
    const set: WorkoutSetData = { type: "BODYWEIGHT", valuesInt: [], valuesSec: [], units: [], completed: false };
    expect(getSetDisplayValue(set)).toBe("N/A");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("WorkoutSet — calculateTotalWorkoutDuration (PE & AVL)", () => {
  it("[PE - Clase Válida] debe sumar la duración total de todos los sets", () => {
    const sets = [{ valuesSec: [30] }, { valuesSec: [45] }, { valuesSec: [60] }];
    expect(calculateTotalWorkoutDuration(sets)).toBe(135);
  });

  it("[AVL - Límite Inferior] debe retornar 0 para una sesión vacía o sin duraciones", () => {
    expect(calculateTotalWorkoutDuration([])).toBe(0);
    expect(calculateTotalWorkoutDuration([{ valuesSec: [] }])).toBe(0);
  });
});