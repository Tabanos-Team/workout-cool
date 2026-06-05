import { describe, it, expect } from "vitest";

import { loginSchema } from "./signin.schema";

describe("loginSchema", () => {
  it("debe validar datos correctos", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
      password: "123456",
    });

    expect(result.success).toBe(true);
  });

  it("debe fallar con email inválido", () => {
    const result = loginSchema.safeParse({
      email: "correo-invalido",
      password: "123456",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar con password menor a 6 caracteres", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
      password: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar con email vacío", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "123456",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar con password vacío", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar si falta email", () => {
    const result = loginSchema.safeParse({
      password: "123456",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar si falta password", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
    });

    expect(result.success).toBe(false);
  });
});