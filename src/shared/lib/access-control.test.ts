import { describe, it, expect } from "vitest";
import {
  getSessionAccess,
  canStartSession,
  type AccessControlContext,
} from "@/shared/lib/access-control";


const ctx = (
  isAuthenticated: boolean,
  isPremium: boolean,
  isSessionPremium: boolean
): AccessControlContext => ({ isAuthenticated, isPremium, isSessionPremium });


describe("getSessionAccess", () => {

    // Regla 1: no autenticado → require_auth
  describe("usuario no autenticado", () => {
    it("false/false/false → require_auth", () => {
      expect(getSessionAccess(ctx(false, false, false))).toBe("require_auth");
    });

    it("false/false/true → require_auth (sesión premium no importa)", () => {
      expect(getSessionAccess(ctx(false, false, true))).toBe("require_auth");
    });

    it("false/true/false → require_auth (isPremium no importa sin auth)", () => {
      expect(getSessionAccess(ctx(false, true, false))).toBe("require_auth");
    });

    it("false/true/true → require_auth (ambas flags ignoradas sin auth)", () => {
      expect(getSessionAccess(ctx(false, true, true))).toBe("require_auth");
    });
  });

  // Regla 2: autenticado + sesión gratuita → allow
  describe("usuario autenticado, sesión gratuita", () => {
    it("true/false/false → allow", () => {
      expect(getSessionAccess(ctx(true, false, false))).toBe("allow");
    });

    it("true/true/false → allow (isPremium irrelevante en sesión gratuita)", () => {
      expect(getSessionAccess(ctx(true, true, false))).toBe("allow");
    });
  });

  // Regla 3: autenticado + sesión premium + sin suscripción → require_premium
  describe("usuario autenticado, sesión premium, sin suscripción", () => {
    it("true/false/true → require_premium", () => {
      expect(getSessionAccess(ctx(true, false, true))).toBe("require_premium");
    });
  });

  // Regla 4: autenticado + sesión premium + con suscripción → allow
  describe("usuario autenticado, sesión premium, con suscripción", () => {
    it("true/true/true → allow", () => {
      expect(getSessionAccess(ctx(true, true, true))).toBe("allow");
    });
  });

  // Cobertura del fallback (línea defensiva)
  describe("fallback defensivo", () => {
    it("ninguna regla produce allow/require_premium inesperado", () => {
      const validActions = ["allow", "require_auth", "require_premium"];
      const allContexts = [
        ctx(false, false, false), ctx(false, false, true),
        ctx(false, true,  false), ctx(false, true,  true),
        ctx(true,  false, false), ctx(true,  false, true),
        ctx(true,  true,  false), ctx(true,  true,  true),
      ];
      allContexts.forEach((c) => {
        expect(validActions).toContain(getSessionAccess(c));
      });
    });
  });
});



describe("canStartSession", () => {
  it("retorna true solo cuando getSessionAccess es 'allow'", () => {
    expect(canStartSession(ctx(true,  false, false))).toBe(true);
    expect(canStartSession(ctx(true,  true,  false))).toBe(true);
    expect(canStartSession(ctx(true,  true,  true))).toBe(true);
  });

  it("retorna false cuando require_auth", () => {
    expect(canStartSession(ctx(false, false, false))).toBe(false);
    expect(canStartSession(ctx(false, true,  true))).toBe(false);
  });

  it("retorna false cuando require_premium", () => {
    expect(canStartSession(ctx(true, false, true))).toBe(false);
  });

  it("es consistente con getSessionAccess en todas las combinaciones", () => {
    const allContexts = [
      ctx(false, false, false), ctx(false, false, true),
      ctx(false, true,  false), ctx(false, true,  true),
      ctx(true,  false, false), ctx(true,  false, true),
      ctx(true,  true,  false), ctx(true,  true,  true),
    ];
    allContexts.forEach((c) => {
      expect(canStartSession(c)).toBe(getSessionAccess(c) === "allow");
    });
  });
});