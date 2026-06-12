import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock estructural obligatorio para primitivas de Radix UI en entornos JSDOM
beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

describe("Pruebas Unitarias - Componente Tabs", () => {

  test("debe renderizar la lista de pestañas y activar por defecto el panel asignado", () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger data-testid="trigger-account" value="account">Cuenta</TabsTrigger>
          <TabsTrigger data-testid="trigger-password" value="password">Contraseña</TabsTrigger>
        </TabsList>
        <TabsContent data-testid="content-account" value="account">
          Configuración de la cuenta.
        </TabsContent>
        <TabsContent data-testid="content-password" value="password">
          Cambia tu contraseña.
        </TabsContent>
      </Tabs>
    );

    const triggerAccount = screen.getByTestId("trigger-account");
    const triggerPassword = screen.getByTestId("trigger-password");
    const contentAccount = screen.getByTestId("content-account");
    const contentPassword = screen.getByTestId("content-password");

    expect(triggerAccount).toHaveAttribute("data-state", "active");
    expect(triggerPassword).toHaveAttribute("data-state", "inactive");

    expect(contentAccount).toBeVisible();
    expect(contentPassword).not.toBeVisible();
  });

  test("debe cambiar de panel dinámicamente al hacer clic en otra pestaña", async () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger data-testid="trigger-account" value="account">Cuenta</TabsTrigger>
          <TabsTrigger data-testid="trigger-password" value="password">Contraseña</TabsTrigger>
        </TabsList>
        <TabsContent data-testid="content-account" value="account">Panel Cuenta</TabsContent>
        <TabsContent data-testid="content-password" value="password">Panel Password</TabsContent>
      </Tabs>
    );

    const triggerAccount = screen.getByTestId("trigger-account");
    const triggerPassword = screen.getByTestId("trigger-password");
    
    // CORRECCIÓN: Radix UI requiere que el elemento reciba el foco antes de procesar el cambio de estado por click
    triggerPassword.focus();
    fireEvent.click(triggerPassword);

    // Esperamos a que los atributos asíncronos cambien de estado en el DOM simulado
    await waitFor(() => {
      expect(triggerPassword).toHaveAttribute("data-state", "active");
      expect(triggerAccount).toHaveAttribute("data-state", "inactive");
    });

    expect(screen.getByTestId("content-password")).toBeVisible();
    expect(screen.getByTestId("content-account")).not.toBeVisible();
  });

  test("debe respetar la propiedad disabled en los disparadores bloqueando su activación", () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger data-testid="trigger-account" value="account">Cuenta</TabsTrigger>
          <TabsTrigger data-testid="trigger-password-disabled" disabled value="password">Contraseña</TabsTrigger>
        </TabsList>
        <TabsContent data-testid="content-account" value="account">Panel Cuenta</TabsContent>
        <TabsContent data-testid="content-password" value="password">Panel Password</TabsContent>
      </Tabs>
    );

    const triggerDisabled = screen.getByTestId("trigger-password-disabled");
    
    expect(triggerDisabled).toBeDisabled();

    fireEvent.click(triggerDisabled);

    expect(screen.getByTestId("trigger-account")).toHaveAttribute("data-state", "active");
    expect(screen.getByTestId("content-password")).not.toBeVisible();
  });

  test("debe forzar la dirección 'ltr' de forma estática en la raíz del componente", () => {
    render(
      <Tabs data-testid="tabs-root" defaultValue="tab1">
        <TabsList><TabsTrigger value="tab1">Tab</TabsTrigger></TabsList>
      </Tabs>
    );

    expect(screen.getByTestId("tabs-root")).toHaveAttribute("dir", "ltr");
  });

  test("debe permitir concatenar clases personalizadas externas usando la utilidad cn", () => {
    render(
      <Tabs className="custom-tabs-layout" defaultValue="tab1">
        <TabsList className="custom-list-bg">
          <TabsTrigger className="custom-trigger-text" value="tab1">Pestaña</TabsTrigger>
        </TabsList>
        <TabsContent className="custom-content-padding" data-testid="content-cn" value="tab1">
          Contenido
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tablist").parentElement).toHaveClass("custom-tabs-layout");
    expect(screen.getByRole("tablist")).toHaveClass("custom-list-bg");
    expect(screen.getByRole("tab")).toHaveClass("custom-trigger-text");
    expect(screen.getByTestId("content-cn")).toHaveClass("custom-content-padding");
  });
});