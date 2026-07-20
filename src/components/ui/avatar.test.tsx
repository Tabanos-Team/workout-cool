import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

describe("Pruebas Unitarias - Componente Avatar", () => {

  beforeEach(() => {

    Object.defineProperty(global.Image.prototype, "src", {
      set(src) {
        if (src) {
          // Mientras "carga": complete=false, como en un navegador real
          Object.defineProperty(this, "complete", { value: false, configurable: true });
          setTimeout(() => {
            // Al "terminar de cargar": complete=true y naturalWidth>0
            Object.defineProperty(this, "complete", { value: true, configurable: true });
            Object.defineProperty(this, "naturalWidth", { value: 1, configurable: true });
            fireEvent(this, new Event("load"));
          }, 0);
        }
      },
    });
  });

  test("debe renderizar la imagen correctamente cuando logra cargar", async () => {
    render(
      <Avatar>
        <AvatarImage alt="User Avatar" data-testid="avatar-image" src="https://example.com/avatar.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    // Al usar findByTestId, esperamos asíncronamente a que el minitimer de beforeEach dispare el evento 'load'
    const image = await screen.findByTestId("avatar-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  test("debe mostrar el contenido del fallback (iniciales) correctamente", () => {
    render(
      <Avatar>
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    );

    const fallbackText = screen.getByText("UA");
    expect(fallbackText).toBeInTheDocument();
  });

  test("aplica las clases de estilo por defecto de Radix en el contenedor raíz", () => {
    render(
      <Avatar data-testid="avatar-style-root">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    const root = screen.getByTestId("avatar-style-root");
    expect(root).toHaveClass("relative", "flex", "rounded-full");
  });
});