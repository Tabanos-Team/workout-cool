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

describe("PWA Manifest - isValidManifest", () => {
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

  it("debe retornar true si el manifest es correcto y completo", () => {
    expect(isValidManifest(validManifest)).toBe(true);
  });

  it("debe retornar false si falta el nombre o short_name", () => {
    expect(isValidManifest({ ...validManifest, name: "" })).toBe(false);
    expect(isValidManifest({ ...validManifest, short_name: "" })).toBe(false);
  });

  it("debe retornar false si display no tiene un valor permitido", () => {
    expect(isValidManifest({ ...validManifest, display: "fullpage" })).toBe(false);
  });
});

describe("PWA Manifest - hasRequiredIconSizes", () => {
  it("debe retornar true si tiene los dos tamanos de icono obligatorios", () => {
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

  it("debe retornar false si falta alguno de los tamanos", () => {
    const manifest: PWAManifest = {
      name: "WC", short_name: "WC", start_url: "/",
      display: "standalone", background_color: "#fff", theme_color: "#000",
      icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
    };
    expect(hasRequiredIconSizes(manifest)).toBe(false);
  });
});

describe("PWA Manifest - isValidColor", () => {
  it("debe validar colores hexadecimales correctos de 3 o 6 digitos", () => {
    expect(isValidColor("#00D4AA")).toBe(true);
    expect(isValidColor("#fff")).toBe(true);
  });

  it("debe rechazar formatos incorrectos", () => {
    expect(isValidColor("00D4AA")).toBe(false);
    expect(isValidColor("#GGGGGG")).toBe(false);
    expect(isValidColor("")).toBe(false);
  });
});

describe("Pagina 404 - get404PageInfo", () => {
  it("debe retornar la informacion de error controlada", () => {
    const info = get404PageInfo();
    expect(info.statusCode).toBe(404);
    expect(info.title).toBeTruthy();
    expect(info.hasHomeLink).toBe(true);
  });
});

describe("Pagina 404 - codigos de estado", () => {
  it("debe validar si el codigo HTTP es correcto", () => {
    expect(isValidStatusCode(404)).toBe(true);
    expect(isValidStatusCode(200)).toBe(true);
    expect(isValidStatusCode(99)).toBe(false);
  });

  it("debe validar si el codigo corresponde a un error 404", () => {
    expect(is404StatusCode(404)).toBe(true);
    expect(is404StatusCode(200)).toBe(false);
  });
});