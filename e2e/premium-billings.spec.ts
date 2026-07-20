import { test, expect } from "@playwright/test";

test.describe("Premium Billings - Redirection Diagnosis", () => {
  // Se asume que la autenticación ya viene inyectada por la configuración global (auth.setup)
  test("Debería interceptar la llamada y navegar al portal de facturación", async ({ page }) => {
    // 1. Escuchar eventos de la consola del navegador para ver si hay errores de JS
    page.on("console", msg => {
      if (msg.type() === "error") console.log("[Browser Error]: ${msg.text()}");
    });

    // 2. Monitorear las respuestas de la API de facturación
    page.on("response", response => {
      if (response.url().includes("/api/premium/billing-portal")) {
        console.log(`[API Response] URL: ${response.url()} | Status: ${response.status()}`);
      }
    });

    // 3. Ir a la página principal de la app
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 4. Hacer clic en el menú del avatar (TE)
    // Ajusta el selector si tu avatar usa otra clase o texto personalizado
    const avatarMenu = page.locator("button:has(svg)").filter({ has: page.locator("path") }).last();
    await avatarMenu.click();
    await expect(avatarMenu).toBeVisible();
    await avatarMenu.click();

    // 5. Hacer clic en "Gestionar suscripción"
    const manageSubscriptionOption = page.getByText("Gestionar suscripción");
    await expect(manageSubscriptionOption).toBeVisible();
    
    // Hacemos el clic esperando a ver si se dispara una navegación o un cambio de url
    await manageSubscriptionOption.click();

    // Esperar unos segundos para capturar qué pasa en la red o si cambia la URL
    await page.waitForTimeout(5000);

    // Verificamos si la URL actual cambió al portal o si sigue igual
    console.log(`[Final URL]: ${page.url()}`);
  });
});