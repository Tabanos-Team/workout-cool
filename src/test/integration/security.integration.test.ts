import { describe, expect, it } from "vitest";

import { apiRequest } from "./helpers/http";

describe("Pruebas de seguridad - Control de acceso", () => {
  it("debe retornar 401 en checkout si el usuario no esta logueado", async () => {
    // Mandar peticion de pago sin enviar cookies
    const response = await apiRequest("/api/premium/checkout", { 
      method: "POST",
      body: {
        planId: "test-plan"
      }
    });
    // Debe denegar el acceso con 401
    expect(response.response.status).toBe(401);
  });

  it("debe retornar 401 en billing-portal si el usuario no esta logueado", async () => {
    // Mandar peticion de portal de facturacion sin enviar cookies
    const response = await apiRequest("/api/premium/billing-portal", { 
      method: "POST",
      body: {
        returnUrl: "http://localhost:3000"
      }
    });
    // Debe denegar el acceso con 401
    expect(response.response.status).toBe(401);
  });
});
