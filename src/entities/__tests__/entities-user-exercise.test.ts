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

// Tests para la entidad User
describe("User logic - isProfileComplete", () => {
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

  it("debe retornar true si el perfil tiene todos los campos completos", () => {
    expect(isProfileComplete(completeUser)).toBe(true);
  });

  it("debe retornar false si falta el email", () => {
    expect(isProfileComplete({ ...completeUser, email: "" })).toBe(false);
  });

  it("debe retornar false si falta la imagen", () => {
    expect(isProfileComplete({ ...completeUser, image: null })).toBe(false);
  });
});

describe("User logic - getFullName", () => {
  it("debe combinar nombre y apellido correctamente", () => {
    expect(getFullName({ firstName: "Oscar", lastName: "Chilo", name: "OC" })).toBe("Oscar Chilo");
  });

  it("debe retornar el name por defecto si nombre y apellido estan vacios", () => {
    expect(getFullName({ firstName: "", lastName: "", name: "Oscar Chilo" })).toBe("Oscar Chilo");
  });
});

describe("User logic - getUserInitials", () => {
  it("debe retornar las iniciales a partir de nombre y apellido", () => {
    expect(getUserInitials({ firstName: "Oscar", lastName: "Chilo", name: "OC" })).toBe("OC");
  });

  it("debe retornar las iniciales a partir del nombre completo", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "Oscar Carlos Chilo" })).toBe("OC");
  });

  it("debe retornar una sola inicial si el nombre tiene una sola palabra", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "Oscar" })).toBe("O");
  });

  it("debe retornar ? si no se puede determinar la inicial", () => {
    expect(getUserInitials({ firstName: "", lastName: "", name: "" })).toBe("?");
  });
});

describe("User logic - isAdmin", () => {
  it("debe retornar true si el usuario es administrador", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
  });

  it("debe retornar false para otros roles", () => {
    expect(isAdmin({ role: "user" })).toBe(false);
  });
});

describe("User logic - isUserBanned", () => {
  it("debe retornar false si el usuario no esta baneado", () => {
    expect(isUserBanned({ banned: false, banExpires: null })).toBe(false);
  });

  it("debe retornar true si el ban es permanente", () => {
    expect(isUserBanned({ banned: true, banExpires: null })).toBe(true);
  });

  it("debe retornar true si el ban aun esta vigente", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
    expect(isUserBanned({ banned: true, banExpires: futureDate })).toBe(true);
  });

  it("debe retornar false si el ban ya vencio", () => {
    const pastDate = new Date(Date.now() - 1000);
    expect(isUserBanned({ banned: true, banExpires: pastDate })).toBe(false);
  });
});

describe("User logic - hasActivePremium", () => {
  it("debe retornar true si el usuario tiene premium directo", () => {
    expect(hasActivePremium({ isPremium: true }, [])).toBe(true);
  });

  it("debe retornar true si tiene una suscripcion activa vigente", () => {
    const sub: UserSubscription = {
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(true);
  });

  it("debe retornar false si la suscripcion expiro", () => {
    const sub: UserSubscription = {
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() - 1000 * 60 * 60),
    };
    expect(hasActivePremium({ isPremium: false }, [sub])).toBe(false);
  });
});

describe("User logic - getUserLocale", () => {
  it("debe retornar el locale del usuario o el de respaldo", () => {
    expect(getUserLocale({ locale: "es" })).toBe("es");
    expect(getUserLocale({ locale: null }, "en")).toBe("en");
  });
});

describe("User logic - isValidEmail", () => {
  it("debe validar correctamente el formato del email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("userexample.com")).toBe(false);
  });
});

// Tests para la entidad Exercise
describe("Exercise logic - isExerciseComplete", () => {
  const completeEx: ExerciseData = {
    id: "ex_1",
    name: "Squat",
    slug: "squat",
    description: "Squat description",
  };

  it("debe retornar true si tiene todos los campos obligatorios", () => {
    expect(isExerciseComplete(completeEx)).toBe(true);
  });

  it("debe retornar false si falta el nombre", () => {
    expect(isExerciseComplete({ ...completeEx, name: "" })).toBe(false);
  });
});

describe("Exercise logic - hasVideoContent", () => {
  it("debe validar si el ejercicio cuenta con enlace de video", () => {
    expect(hasVideoContent({ id: "1", name: "Squat", fullVideoUrl: "https://youtube.com/watch?v=1" })).toBe(true);
    expect(hasVideoContent({ id: "1", name: "Squat", fullVideoUrl: "" })).toBe(false);
  });
});

describe("Exercise logic - getBilingual", () => {
  it("debe preferir el nombre en ingles si existe", () => {
    expect(getBilingual("Sentadilla", "Squat")).toBe("Squat");
    expect(getBilingual("Sentadilla", null)).toBe("Sentadilla");
  });
});

describe("Exercise logic - attributes", () => {
  const attrs: ExerciseAttribute[] = [
    { attributeName: "PRIMARY_MUSCLE", attributeValue: "QUADRICEPS" },
    { attributeName: "TYPE", attributeValue: "STRENGTH" },
  ];

  it("debe validar la presencia de atributos principales", () => {
    expect(isPrimaryMusclePresent(attrs)).toBe(true);
    expect(isExerciseTypePresent(attrs)).toBe(true);
  });
});

describe("Exercise logic - generateSlug", () => {
  it("debe formatear el nombre para generar un slug valido", () => {
    expect(generateSlug("Barbell Squat")).toBe("barbell-squat");
    expect(generateSlug("Bench Press (Flat)")).toBe("bench-press-flat");
    expect(generateSlug("")).toBe("");
  });
});

// Tests para WorkoutSet
describe("WorkoutSet logic - isSetComplete", () => {
  it("debe verificar si la serie esta completada", () => {
    expect(isSetComplete({ type: "REPS", valuesInt: [], valuesSec: [], units: [], completed: true })).toBe(true);
    expect(isSetComplete({ type: "REPS", valuesInt: [], valuesSec: [], units: [], completed: false })).toBe(false);
  });
});

describe("WorkoutSet logic - getSetDisplayValue", () => {
  it("debe dar formato para series de repeticiones y peso", () => {
    const set: WorkoutSetData = { type: "REPS", valuesInt: [10, 80], valuesSec: [], units: ["kg"], completed: false };
    expect(getSetDisplayValue(set)).toBe("10 reps @ 80kg");
  });

  it("debe dar formato para series por tiempo", () => {
    const set: WorkoutSetData = { type: "TIME", valuesInt: [], valuesSec: [30], units: [], completed: false };
    expect(getSetDisplayValue(set)).toBe("30s");
  });

  it("debe retornar N/A para formatos no definidos", () => {
    const set: WorkoutSetData = { type: "BODYWEIGHT", valuesInt: [], valuesSec: [], units: [], completed: false };
    expect(getSetDisplayValue(set)).toBe("N/A");
  });
});

describe("WorkoutSet logic - calculateTotalWorkoutDuration", () => {
  it("debe sumar el tiempo total de las series", () => {
    const sets = [{ valuesSec: [30] }, { valuesSec: [45] }];
    expect(calculateTotalWorkoutDuration(sets)).toBe(75);
    expect(calculateTotalWorkoutDuration([])).toBe(0);
  });
});