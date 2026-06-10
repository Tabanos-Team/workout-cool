import { describe, it, expect } from "vitest";

import {
  type PWAManifest,
  isValidManifest,
  hasRequiredIconSizes,
  isValidColor,
  get404PageInfo,
  isValidStatusCode,
  is404StatusCode,
} from "../pwa-not-found-logic";

// ════════════════════════════════════════════════════════════════════
// TESTS PWA
// ════════════════════════════════════════════════════════════════════

describe("PWA Manifest — isValidManifest", () => {
  const validManifest: PWAManifest = {
    name: "Workout Cool",
    short_name: "WorkoutCool",
    description: "Modern open-source fitness coaching platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00D4AA",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };

  it("debe ser válido con todos los campos correctos", () => {
    expect(isValidManifest(validManifest)).toBe(true);
  });

  it("debe ser inválido si falta el name", () => {
    expect(isValidManifest({ ...validManifest, name: "" })).toBe(false);
  });

  it("debe ser inválido si falta short_name", () => {
    expect(isValidManifest({ ...validManifest, short_name: "" })).toBe(false);
  });

  it("debe ser inválido si start_url está vacío", () => {
    expect(isValidManifest({ ...validManifest, start_url: "" })).toBe(false);
  });

  it("debe ser inválido si display no es un valor permitido", () => {
    expect(isValidManifest({ ...validManifest, display: "fullpage" })).toBe(false);
  });

  it("debe aceptar display 'standalone'", () => {
    expect(isValidManifest({ ...validManifest, display: "standalone" })).toBe(true);
  });

  it("debe aceptar display 'fullscreen'", () => {
    expect(isValidManifest({ ...validManifest, display: "fullscreen" })).toBe(true);
  });

  it("debe ser inválido si no hay icons", () => {
    expect(isValidManifest({ ...validManifest, icons: [] })).toBe(false);
  });
});

describe("PWA Manifest — hasRequiredIconSizes", () => {
  it("debe retornar true si tiene 192x192 y 512x512", () => {
    const manifest: PWAManifest = {
      name: "WC", short_name: "WC", start_url: "/",
      display: "standalone", background_color: "#fff", theme_color: "#000",
      icons: [
        { src: "/icon.png", sizes: "192x192", type: "image/png" },
        { src: "/icon.png", sizes: "512x512", type: "image/png" },
      ],
    };
    expect(hasRequiredIconSizes(manifest)).toBe(true);
  });

  it("debe retornar false si falta el ícono 512x512", () => {
    const manifest: PWAManifest = {
      name: "WC", short_name: "WC", start_url: "/",
      display: "standalone", background_color: "#fff", theme_color: "#000",
      icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
    };
    expect(hasRequiredIconSizes(manifest)).toBe(false);
  });

  it("debe retornar false si falta el ícono 192x192", () => {
    const manifest: PWAManifest = {
      name: "WC", short_name: "WC", start_url: "/",
      display: "standalone", background_color: "#fff", theme_color: "#000",
      icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
    };
    expect(hasRequiredIconSizes(manifest)).toBe(false);
  });

  it("debe retornar false si no hay icons", () => {
    const manifest: PWAManifest = {
      name: "WC", short_name: "WC", start_url: "/",
      display: "standalone", background_color: "#fff", theme_color: "#000",
      icons: [],
    };
    expect(hasRequiredIconSizes(manifest)).toBe(false);
  });
});

describe("PWA Manifest — isValidColor", () => {
  it("debe validar color hex de 6 dígitos", () => {
    expect(isValidColor("#00D4AA")).toBe(true);
    expect(isValidColor("#ffffff")).toBe(true);
  });

  it("debe validar color hex de 3 dígitos", () => {
    expect(isValidColor("#fff")).toBe(true);
    expect(isValidColor("#000")).toBe(true);
  });

  it("debe rechazar color sin #", () => {
    expect(isValidColor("00D4AA")).toBe(false);
  });

  it("debe rechazar color con caracteres inválidos", () => {
    expect(isValidColor("#GGGGGG")).toBe(false);
  });

  it("debe rechazar string vacío", () => {
    expect(isValidColor("")).toBe(false);
  });

  it("los colores del manifest de workout-cool deben ser válidos", () => {
    expect(isValidColor("#00D4AA")).toBe(true); // theme_color
    expect(isValidColor("#ffffff")).toBe(true); // background_color
  });
});

// ════════════════════════════════════════════════════════════════════
// TESTS 404
// ════════════════════════════════════════════════════════════════════

describe("Página 404 — get404PageInfo", () => {
  it("debe retornar statusCode 404", () => {
    expect(get404PageInfo().statusCode).toBe(404);
  });

  it("debe tener título definido", () => {
    expect(get404PageInfo().title).toBeTruthy();
  });

  it("debe tener enlace al home", () => {
    expect(get404PageInfo().hasHomeLink).toBe(true);
  });

  it("debe tener mensaje de error", () => {
    expect(get404PageInfo().message.length).toBeGreaterThan(0);
  });
});

describe("Página 404 — isValidStatusCode", () => {
  it("debe retornar true para 404", () => {
    expect(isValidStatusCode(404)).toBe(true);
  });

  it("debe retornar true para 200", () => {
    expect(isValidStatusCode(200)).toBe(true);
  });

  it("debe retornar false para código menor a 100", () => {
    expect(isValidStatusCode(99)).toBe(false);
  });

  it("debe retornar false para código mayor a 599", () => {
    expect(isValidStatusCode(600)).toBe(false);
  });

  it("debe retornar true para límite inferior (100)", () => {
    expect(isValidStatusCode(100)).toBe(true);
  });

  it("debe retornar true para límite superior (599)", () => {
    expect(isValidStatusCode(599)).toBe(true);
  });
});

describe("Página 404 — is404StatusCode", () => {
  it("debe retornar true solo para 404", () => {
    expect(is404StatusCode(404)).toBe(true);
  });

  it("debe retornar false para 200", () => {
    expect(is404StatusCode(200)).toBe(false);
  });

  it("debe retornar false para 500", () => {
    expect(is404StatusCode(500)).toBe(false);
  });

  it("debe retornar false para 403", () => {
    expect(is404StatusCode(403)).toBe(false);
  });

  it("debe retornar false para 405 (justo después del 404 — AVL)", () => {
    expect(is404StatusCode(405)).toBe(false);
  });

  it("debe retornar false para 403 (justo antes del 404 — AVL)", () => {
    expect(is404StatusCode(403)).toBe(false);
  });
});