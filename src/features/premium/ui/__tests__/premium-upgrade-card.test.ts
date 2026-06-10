import { describe, it, expect } from "vitest";

import {
  formatPrice,
  getButtonState,
  getCurrentPlan,
  getSavingsPercentage,
  buildRedirectUrl,
} from "../../lib/premium-upgrade-logic";

describe("PremiumUpgradeCard - formatPrice", () => {
  it("debe formatear precios en EUR con decimales", () => {
    const result = formatPrice(7.9, "EUR", "fr");
    expect(result).toContain("7");
    expect(result).toContain("90");
  });

  it("debe formatear precios en USD sin forzar decimales si son enteros", () => {
    const result = formatPrice(10, "USD", "en");
    expect(result).toContain("10");
  });

  it("debe manejar valores negativos o cero", () => {
    expect(() => formatPrice(0, "EUR")).not.toThrow();
    expect(formatPrice(-1, "EUR", "fr")).toContain("1");
  });
});

describe("PremiumUpgradeCard - getButtonState", () => {
  const PLAN_ID = "premium-monthly";

  it("debe retornar processing si el pago esta pendiente para el plan seleccionado", () => {
    const state = getButtonState({
      isCheckoutPending: true,
      selectedPlan: PLAN_ID,
      currentPlanId: PLAN_ID,
      isAuthenticated: true,
    });
    expect(state).toBe("processing");
  });

  it("debe retornar login-required si el usuario no esta autenticado", () => {
    const state = getButtonState({
      isCheckoutPending: false,
      selectedPlan: null,
      currentPlanId: PLAN_ID,
      isAuthenticated: false,
    });
    expect(state).toBe("login-required");
  });

  it("debe retornar go-premium si esta autenticado y no hay pagos pendientes", () => {
    const state = getButtonState({
      isCheckoutPending: false,
      selectedPlan: null,
      currentPlanId: PLAN_ID,
      isAuthenticated: true,
    });
    expect(state).toBe("go-premium");
  });
});

describe("PremiumUpgradeCard - getCurrentPlan", () => {
  it("debe retornar la estructura del plan mensual", () => {
    const plan = getCurrentPlan(false);
    expect(plan.planId).toBe("premium-monthly");
    expect(plan.monthly).toBe(7.9);
  });

  it("debe retornar la estructura del plan anual con precio mensual equivalente", () => {
    const plan = getCurrentPlan(true, 7.9, 49.0);
    expect(plan.planId).toBe("premium-yearly");
    expect(plan.yearlyPerMonth).toBeLessThan(plan.monthly);
  });
});

describe("PremiumUpgradeCard - getSavingsPercentage", () => {
  it("debe calcular el porcentaje de ahorro correctamente", () => {
    const savings = getSavingsPercentage(7.9, 49.0);
    expect(savings).toBeGreaterThan(40);
    expect(savings).toBeLessThan(60);
  });

  it("debe retornar 0 si no hay ahorro", () => {
    expect(getSavingsPercentage(10, 120)).toBe(0);
  });
});

describe("PremiumUpgradeCard - buildRedirectUrl", () => {
  it("debe construir la URL de redireccion para el inicio de sesion", () => {
    const url = buildRedirectUrl("fr");
    expect(url).toBe("/auth/signin?redirect=%2Ffr%2Fpremium");
  });
});