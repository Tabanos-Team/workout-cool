import { describe, it, expect } from "vitest";
import { nullToUndefined } from "./format";

describe("utilidades de formato", () => {
  it("convierte null a undefined", () => {
    expect(nullToUndefined(null)).toBeUndefined();
  });

  it("retorna una cadena de texto sin modificar", () => {
    expect(
      nullToUndefined("Rutina Full Body")
    ).toBe("Rutina Full Body");
  });

  it("retorna un número sin modificar", () => {
    expect(
      nullToUndefined(12)
    ).toBe(12);
  });

  it("retorna un valor booleano sin modificar", () => {
    expect(
      nullToUndefined(true)
    ).toBe(true);
  });

  it("retorna un objeto sin modificar", () => {
    const routine = {
      id: 1,
      name: "Rutina de Fuerza",
    };

    expect(
      nullToUndefined(routine)
    ).toEqual(routine);
  });

  it("retorna undefined cuando recibe undefined", () => {
    expect(
      nullToUndefined(undefined)
    ).toBeUndefined();
  });
});