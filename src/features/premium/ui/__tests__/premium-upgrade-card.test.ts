/**
 * ARCHIVO: src/features/premium/ui/__tests__/premium-upgrade-card.test.ts
 *
 * Tests unitarios para la lógica de negocio pura extraída de PremiumUpgradeCard.
 * Se prueba sin montar el componente React (sin dependencias de hooks/router).
 *
 * Ejecutar: pnpm vitest run src/features/premium/ui/__tests__/premium-upgrade-card.test.ts
 */

import { describe, it, expect } from "vitest";

import {
  formatPrice,
  type ButtonState,
  getButtonState,
  type PlanPrices,
  getCurrentPlan,
  getSavingsPercentage,
  buildRedirectUrl,
} from "../../lib/premium-upgrade-logic";

// ─────────────────────────────────────────────────────────────────────────────
// SUITE: formatPrice
// ─────────────────────────────────────────────────────────────────────────────

describe("PremiumUpgradeCard — formatPrice", () => {

  describe("con EUR", () => {
    it("debe formatear precio mensual (7.9 EUR) con 2 decimales", () => {
      const result = formatPrice(7.9, "EUR", "fr");
      expect(result).toContain("7");
      expect(result).toContain("90"); // 7,90 €
    });

    it("debe formatear precio 0 como gratis (0,00 €)", () => {
      const result = formatPrice(0, "EUR", "fr");
      expect(result).toContain("0");
    });

    it("debe incluir símbolo de moneda EUR", () => {
      const result = formatPrice(7.9, "EUR", "en");
      expect(result).toMatch(/€|\bEUR\b/);
    });

    it("debe formatear precio anual (49.0 EUR)", () => {
      const result = formatPrice(49.0, "EUR", "fr");
      expect(result).toContain("49");
    });
  });

  describe("con USD", () => {
    it("debe formatear USD sin mínimo de 2 decimales forzado por EUR", () => {
      const result = formatPrice(10, "USD", "en");
      expect(result).toContain("10");
    });

    it("debe incluir símbolo de moneda USD", () => {
      const result = formatPrice(9.99, "USD", "en");
      expect(result).toMatch(/\$|\bUSD\b/);
    });
  });

  describe("con locale zh-CN", () => {
    it("debe usar zh-CN como locale cuando el locale es zh-CN", () => {
      // No lanza error con locale zh-CN y currency CNY
      expect(() => formatPrice(50, "CNY", "zh-CN")).not.toThrow();
    });
  });

  describe("valores extremos (AVL)", () => {
    it("debe manejar precio muy alto sin errores", () => {
      expect(() => formatPrice(999999.99, "EUR", "fr")).not.toThrow();
    });

    it("debe manejar precio negativo (edge case)", () => {
      const result = formatPrice(-1, "EUR", "fr");
      expect(result).toContain("1");
    });

    it("precio 0 no debe lanzar error", () => {
      expect(() => formatPrice(0, "EUR")).not.toThrow();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE: getButtonState
// ─────────────────────────────────────────────────────────────────────────────

describe("PremiumUpgradeCard — getButtonState (estado del botón)", () => {

  const PLAN_ID = "premium-monthly";

  describe("estado 'processing'", () => {
    it("debe ser 'processing' cuando hay checkout pendiente para el plan actual", () => {
      expect(getButtonState({
        isCheckoutPending: true,
        selectedPlan: PLAN_ID,
        currentPlanId: PLAN_ID,
        isAuthenticated: true,
      })).toBe("processing");
    });

    it("NO debe ser 'processing' si el checkout es para otro plan", () => {
      expect(getButtonState({
        isCheckoutPending: true,
        selectedPlan: "premium-yearly",
        currentPlanId: PLAN_ID,
        isAuthenticated: true,
      })).not.toBe("processing");
    });

    it("NO debe ser 'processing' si isCheckoutPending es false", () => {
      expect(getButtonState({
        isCheckoutPending: false,
        selectedPlan: PLAN_ID,
        currentPlanId: PLAN_ID,
        isAuthenticated: true,
      })).not.toBe("processing");
    });
  });

  describe("estado 'login-required'", () => {
    it("debe ser 'login-required' cuando el usuario no está autenticado", () => {
      expect(getButtonState({
        isCheckoutPending: false,
        selectedPlan: null,
        currentPlanId: PLAN_ID,
        isAuthenticated: false,
      })).toBe("login-required");
    });

    it("debe ser 'login-required' incluso si hay selectedPlan pero no está autenticado", () => {
      expect(getButtonState({
        isCheckoutPending: false,
        selectedPlan: PLAN_ID,
        currentPlanId: PLAN_ID,
        isAuthenticated: false,
      })).toBe("login-required");
    });
  });

  describe("estado 'go-premium'", () => {
    it("debe ser 'go-premium' cuando está autenticado y no hay checkout pendiente", () => {
      expect(getButtonState({
        isCheckoutPending: false,
        selectedPlan: null,
        currentPlanId: PLAN_ID,
        isAuthenticated: true,
      })).toBe("go-premium");
    });

    it("debe ser 'go-premium' cuando está autenticado con selectedPlan en otro plan", () => {
      expect(getButtonState({
        isCheckoutPending: true,
        selectedPlan: "otro-plan",
        currentPlanId: PLAN_ID,
        isAuthenticated: true,
      })).toBe("go-premium");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE: getCurrentPlan (toggle mensual/anual)
// ─────────────────────────────────────────────────────────────────────────────

describe("PremiumUpgradeCard — getCurrentPlan (toggle de precios)", () => {

  describe("plan mensual (isYearly = false)", () => {
    it("debe retornar planId 'premium-monthly'", () => {
      expect(getCurrentPlan(false).planId).toBe("premium-monthly");
    });

    it("debe retornar precio mensual de 7.9 por defecto", () => {
      expect(getCurrentPlan(false).monthly).toBe(7.9);
    });

    it("debe retornar currency EUR por defecto", () => {
      expect(getCurrentPlan(false).currency).toBe("EUR");
    });
  });

  describe("plan anual (isYearly = true)", () => {
    it("debe retornar planId 'premium-yearly'", () => {
      expect(getCurrentPlan(true).planId).toBe("premium-yearly");
    });

    it("debe retornar precio anual de 49.0 por defecto", () => {
      expect(getCurrentPlan(true).yearly).toBe(49.0);
    });

    it("debe calcular precio mensual equivalente del anual", () => {
      const plan = getCurrentPlan(true, 7.9, 49.0);
      expect(plan.yearlyPerMonth).toBeCloseTo(49.0 / 12, 2);
    });

    it("el precio mensual-del-anual debe ser menor que el precio mensual directo", () => {
      const plan = getCurrentPlan(true, 7.9, 49.0);
      expect(plan.yearlyPerMonth).toBeLessThan(plan.monthly);
    });
  });

  describe("con precios personalizados (API data)", () => {
    it("debe usar precios de la API cuando se proporcionan", () => {
      const plan = getCurrentPlan(false, 9.99, 79.99, "USD");
      expect(plan.monthly).toBe(9.99);
      expect(plan.currency).toBe("USD");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE: getSavingsPercentage
// ─────────────────────────────────────────────────────────────────────────────

describe("PremiumUpgradeCard — getSavingsPercentage (cálculo de descuento)", () => {

  it("debe calcular el ahorro correcto para 7.9/mes vs 49/año", () => {
    // 49/12 = 4.083/mes → ahorro = (7.9 - 4.083) / 7.9 = ~48%
    const savings = getSavingsPercentage(7.9, 49.0);
    expect(savings).toBeGreaterThan(40);
    expect(savings).toBeLessThan(60);
  });

  it("debe retornar 0% cuando el precio anual equivale exactamente al mensual * 12", () => {
    const savings = getSavingsPercentage(10, 120); // 120/12 = 10
    expect(savings).toBe(0);
  });

  it("debe retornar positivo cuando el plan anual es más barato", () => {
    expect(getSavingsPercentage(10, 60)).toBeGreaterThan(0);
  });

  it("el resultado debe ser un número entero (redondeado)", () => {
    const savings = getSavingsPercentage(7.9, 49.0);
    expect(Number.isInteger(savings)).toBe(true);
  });

  it("debe manejar precio 0 mensual sin división por cero crítica", () => {
    // No debe lanzar error, aunque el resultado sea Infinity o NaN
    expect(() => getSavingsPercentage(0, 0)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE: buildRedirectUrl
// ─────────────────────────────────────────────────────────────────────────────

describe("PremiumUpgradeCard — buildRedirectUrl (redirección post-login)", () => {

  it("debe construir URL correcta para locale 'fr'", () => {
    const url = buildRedirectUrl("fr");
    expect(url).toBe("/auth/signin?redirect=%2Ffr%2Fpremium");
  });

  it("debe construir URL correcta para locale 'en'", () => {
    const url = buildRedirectUrl("en");
    expect(url).toContain("/auth/signin");
    expect(url).toContain("en");
    expect(url).toContain("premium");
  });

  it("debe encodear correctamente el redirect (sin / sin encodear)", () => {
    const url = buildRedirectUrl("es");
    expect(url).not.toContain("redirect=/"); // el slash debe estar encodado
    expect(url).toContain("redirect=%2F");   // %2F = /
  });

  it("debe incluir el basePath en la URL encodada", () => {
    const url = buildRedirectUrl("fr", "/premium");
    expect(decodeURIComponent(url)).toContain("/fr/premium");
  });

  it("debe funcionar con cualquier locale de los soportados", () => {
    const locales = ["fr", "en", "es", "pt", "ru", "zh-CN", "de", "ja", "ko"];
    locales.forEach((locale) => {
      expect(() => buildRedirectUrl(locale)).not.toThrow();
    });
  });
});