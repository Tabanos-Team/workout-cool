import { describe, it, expect } from "vitest";

import {
  formatDate,
  formatDateShort,
  getCurrentDate,
  parseDate,
  formatRelativeTime,
} from "./date";

describe("utilidades de fecha", () => {
  it("formatea la fecha de publicación de una rutina en inglés", () => {
    const result = formatDate("2026-06-01", "en");

    expect(result).toContain("2026");
  });

  it("utiliza formato predeterminado cuando el idioma no está soportado", () => {
    const result = formatDate("2026-06-01", "xx");

    expect(result).toContain("2026");
  });

  it("formatea correctamente una fecha corta", () => {
    const result = formatDateShort("2026-06-01", "en");

    expect(result).toContain("2026");
  });

  it("obtiene la fecha actual del sistema", () => {
    const result = getCurrentDate();

    expect(result.isValid()).toBe(true);
  });

  it("convierte correctamente una fecha en texto a objeto fecha", () => {
    const result = parseDate("2026-06-01");

    expect(result.isValid()).toBe(true);
  });

  it("retorna nulo cuando no existe fecha de referencia", () => {
    expect(formatRelativeTime(null)).toBeNull();
  });

  it("muestra 'just now' para una rutina publicada hace pocos segundos", () => {
    const now = new Date();

    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("muestra 'just now' para fechas futuras", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);

    expect(formatRelativeTime(future)).toBe("just now");
  });

  it("muestra tiempo relativo para publicaciones antiguas", () => {
    const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const result = formatRelativeTime(past);

    expect(result).not.toBeNull();
    expect(result).not.toBe("just now");
  });
});