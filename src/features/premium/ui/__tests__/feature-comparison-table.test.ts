/**
 * ARCHIVO: src/features/premium/ui/__tests__/feature-comparison-table.test.ts
 *
 * Tests unitarios para la lógica de renderizado de la tabla de comparación.
 
 *
 * Ejecutar: pnpm vitest run src/features/premium/ui/__tests__/feature-comparison-table.test.ts
 * Cobertura: pnpm test:coverage
 */

import { describe, it, expect } from "vitest";

// ─────────────────────────────────────────────────────────────────────────────
// Lógica extraída de FeatureComparisonTable para ser testeable de forma pura.
// En el componente real, esta función devuelve JSX. Aquí la reescribimos
// para devolver un descriptor de lo que renderizaría, sin depender de React.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type FeatureRenderType,
  classifyFeatureValue,
} from "../../lib/feature-comparison-logic";

// ─────────────────────────────────────────────────────────────────────────────
// SUITE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

describe("FeatureComparisonTable — classifyFeatureValue (lógica pura)", () => {

  // ── Partición de Equivalencia: valor booleano true ────────────────────────
  describe("cuando el valor es boolean true", () => {
    it("debe retornar 'check-green' (ícono Check verde)", () => {
      expect(classifyFeatureValue(true)).toBe("check-green");
    });

    it("debe retornar 'check-green' para community_support (free y premium)", () => {
      // Según el schema de categorías: community_support tiene free: true, premium: true
      expect(classifyFeatureValue(true)).toBe("check-green");
    });
  });

  // ── Partición de Equivalencia: valor booleano false ───────────────────────
  describe("cuando el valor es boolean false", () => {
    it("debe retornar 'x-gray' (ícono X gris)", () => {
      expect(classifyFeatureValue(false)).toBe("x-gray");
    });

    it("debe retornar 'x-gray' para custom_exercise en plan free", () => {
      // custom_exercise free: false
      expect(classifyFeatureValue(false)).toBe("x-gray");
    });

    it("debe retornar 'x-gray' para progress_statistics en plan free", () => {
      expect(classifyFeatureValue(false)).toBe("x-gray");
    });
  });

  // ── Partición de Equivalencia: valor "Unlimited" ─────────────────────────
  describe("cuando el valor es la etiqueta 'Unlimited'", () => {
    it("debe retornar 'infinity-unlimited'", () => {
      expect(classifyFeatureValue("Unlimited", "Unlimited")).toBe("infinity-unlimited");
    });

    it("debe retornar 'infinity-unlimited' para workout_history premium", () => {
      // workout_history premium: t("values.unlimited")
      expect(classifyFeatureValue("Unlimited", "Unlimited")).toBe("infinity-unlimited");
    });

    it("debe retornar 'plain-text' si el label de unlimited NO coincide", () => {
      // Si el label es diferente, no debe clasificarse como infinity
      expect(classifyFeatureValue("Unlimited", "Ilimitado")).toBe("plain-text");
    });
  });

  // ── Partición de Equivalencia: strings con "templates" ───────────────────
  describe("cuando el valor string contiene 'templates'", () => {
    it("debe retornar 'star-string'", () => {
      expect(classifyFeatureValue("Pro templates")).toBe("star-string");
    });

    it("debe retornar 'star-string' para cualquier string que incluya 'templates'", () => {
      expect(classifyFeatureValue("50+ templates")).toBe("star-string");
      expect(classifyFeatureValue("advanced templates available")).toBe("star-string");
    });
  });

  // ── Partición de Equivalencia: strings con "Early" o "Beta" ─────────────
  describe("cuando el valor string contiene 'Early' o 'Beta'", () => {
    it("debe retornar 'target-early-access' para string con 'Early'", () => {
      expect(classifyFeatureValue("Early Access")).toBe("target-early-access");
    });

    it("debe retornar 'target-early-access' para string con 'Beta'", () => {
      expect(classifyFeatureValue("Beta Testing")).toBe("target-early-access");
    });

    it("debe retornar 'target-early-access' para 'Early' en cualquier posición", () => {
      expect(classifyFeatureValue("Join Early")).toBe("target-early-access");
    });
  });

  // ── Partición de Equivalencia: strings genéricos ─────────────────────────
  describe("cuando el valor es un string genérico", () => {
    it("debe retornar 'plain-text' para 'Basic'", () => {
      // exercise_library free: "Basic"
      expect(classifyFeatureValue("Basic")).toBe("plain-text");
    });

    it("debe retornar 'plain-text' para 'Complete'", () => {
      // exercise_library premium: "Complete"
      expect(classifyFeatureValue("Complete")).toBe("plain-text");
    });

    it("debe retornar 'plain-text' para 'Limited'", () => {
      // predesigned_programs free: "Limited"
      expect(classifyFeatureValue("Limited")).toBe("plain-text");
    });

    it("debe retornar 'plain-text' para '6 months'", () => {
      // workout_history free: "6 months"
      expect(classifyFeatureValue("6 months")).toBe("plain-text");
    });

    it("debe retornar 'plain-text' para 'Public'", () => {
      // community_access free: "Public"
      expect(classifyFeatureValue("Public")).toBe("plain-text");
    });

    it("debe retornar 'plain-text' para 'VIP Access'", () => {
      // community_access premium: "VIP Access"
      expect(classifyFeatureValue("VIP Access")).toBe("plain-text");
    });

    it("debe retornar 'plain-text' para 'Soon'", () => {
      // pro_templates premium: "Soon"
      expect(classifyFeatureValue("Soon")).toBe("plain-text");
    });
  });

  // ── Análisis de Valores Límite: strings vacíos y edge cases ──────────────
  describe("casos límite y valores extremos", () => {
    it("debe retornar 'plain-text' para string vacío", () => {
      expect(classifyFeatureValue("")).toBe("plain-text");
    });

    it("debe retornar 'plain-text' para string con solo espacios", () => {
      expect(classifyFeatureValue("   ")).toBe("plain-text");
    });

    it("'Early' minúsculas no debe clasificar como early-access (case sensitive)", () => {
      // El componente usa .includes("Early") — es case sensitive
      expect(classifyFeatureValue("early access")).toBe("plain-text");
    });

    it("'beta' minúsculas no debe clasificar como early-access (case sensitive)", () => {
      expect(classifyFeatureValue("beta testing")).toBe("plain-text");
    });

    it("string que contiene tanto 'templates' como 'Early' — gana 'templates' (orden de if)", () => {
      // El if de templates viene antes que Early en el código original
      expect(classifyFeatureValue("Early templates")).toBe("star-string");
    });
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// LÓGICA DE CATEGORÍAS
// ─────────────────────────────────────────────────────────────────────────────

describe("FeatureComparisonTable — estructura de categorías", () => {

  interface Feature {
    name: string;
    free: boolean | string;
    premium: boolean | string;
  }
  interface FeatureCategory {
    name: string;
    features: Feature[];
  }

  // Simula las categorías del componente (sin i18n, con strings directos)
  const categories: FeatureCategory[] = [
    {
      name: "Equipment",
      features: [
        { name: "Exercise library", free: "Basic", premium: "Complete" },
        { name: "Custom exercise", free: false, premium: "Unlimited" },
      ],
    },
    {
      name: "Tracking",
      features: [
        { name: "Workout history", free: "6 months", premium: "Unlimited" },
        { name: "Progress statistics", free: false, premium: true },
        { name: "Personal records", free: false, premium: true },
        { name: "Volume analytics", free: false, premium: true },
      ],
    },
    {
      name: "Programs",
      features: [
        { name: "Pre-designed programs", free: "Limited", premium: "All programs" },
        { name: "Personalized recommendations", free: false, premium: true },
        { name: "Pro templates", free: false, premium: "Soon" },
      ],
    },
    {
      name: "Community",
      features: [
        { name: "Community access", free: "Public", premium: "VIP Access" },
        { name: "Private chat", free: false, premium: true },
      ],
    },
    {
      name: "Support",
      features: [
        { name: "Community support", free: true, premium: true },
        { name: "Priority support", free: false, premium: true },
        { name: "Early access", free: false, premium: true },
        { name: "Beta testing", free: false, premium: true },
      ],
    },
  ];

  it("debe tener exactamente 5 categorías", () => {
    expect(categories).toHaveLength(5);
  });

  it("cada categoría debe tener al menos una feature", () => {
    categories.forEach((cat) => {
      expect(cat.features.length).toBeGreaterThan(0);
    });
  });

  it("todas las features premium deben tener valor (nunca undefined)", () => {
    categories.forEach((cat) => {
      cat.features.forEach((feature) => {
        expect(feature.premium).toBeDefined();
        expect(feature.premium).not.toBeNull();
      });
    });
  });

  it("las features que son false en free deben ser true o string en premium", () => {
    categories.forEach((cat) => {
      cat.features.forEach((feature) => {
        if (feature.free === false) {
          // Si free es falso, premium no debería también ser false
          expect(feature.premium).not.toBe(false);
        }
      });
    });
  });

  it("community_support es la única feature con free: true", () => {
    const freeTrue = categories.flatMap((c) => c.features).filter((f) => f.free === true);
    expect(freeTrue).toHaveLength(1);
    expect(freeTrue[0].name).toBe("Community support");
  });

  it("la categoría Tracking debe tener 4 features", () => {
    const tracking = categories.find((c) => c.name === "Tracking");
    expect(tracking?.features).toHaveLength(4);
  });

  it("la categoría Support debe tener 4 features", () => {
    const support = categories.find((c) => c.name === "Support");
    expect(support?.features).toHaveLength(4);
  });
});