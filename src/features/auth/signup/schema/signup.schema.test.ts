import { describe, it, expect } from "vitest";

import { signUpSchema } from "./signup.schema";

describe("signUpSchema", () => {
  it("debe validar un registro correcto", () => {
    const result = signUpSchema.safeParse({
      firstName: "Richard",
      lastName: "Perez",
      email: "richard@test.com",
      password: "12345678",
      verifyPassword: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("debe fallar con email inválido", () => {
    const result = signUpSchema.safeParse({
      firstName: "Richard",
      lastName: "Perez",
      email: "correo-invalido",
      password: "12345678",
      verifyPassword: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar con password menor a 8 caracteres", () => {
    const result = signUpSchema.safeParse({
      firstName: "Richard",
      lastName: "Perez",
      email: "richard@test.com",
      password: "1234567",
      verifyPassword: "1234567",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar con verifyPassword menor a 8 caracteres", () => {
    const result = signUpSchema.safeParse({
      firstName: "Richard",
      lastName: "Perez",
      email: "richard@test.com",
      password: "12345678",
      verifyPassword: "1234567",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar si falta firstName", () => {
    const result = signUpSchema.safeParse({
      lastName: "Perez",
      email: "richard@test.com",
      password: "12345678",
      verifyPassword: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar si falta lastName", () => {
    const result = signUpSchema.safeParse({
      firstName: "Richard",
      email: "richard@test.com",
      password: "12345678",
      verifyPassword: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar si falta email", () => {
    const result = signUpSchema.safeParse({
      firstName: "Richard",
      lastName: "Perez",
      password: "12345678",
      verifyPassword: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar si falta password", () => {
    const result = signUpSchema.safeParse({
      firstName: "Richard",
      lastName: "Perez",
      email: "richard@test.com",
      verifyPassword: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("debe fallar si falta verifyPassword", () => {
    const result = signUpSchema.safeParse({
      firstName: "Richard",
      lastName: "Perez",
      email: "richard@test.com",
      password: "12345678",
    });

    expect(result.success).toBe(false);
  });
});