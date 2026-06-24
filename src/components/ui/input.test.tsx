import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Input } from "./input";

describe("Pruebas Unitarias - Componente Input", () => {
  test("debe renderizar el elemento input correctamente con sus propiedades nativas", () => {
    render(<Input data-testid="base-input" placeholder="Nombre de usuario" />);
    
    const input = screen.getByTestId("base-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Nombre de usuario");
    
    // Evaluamos la propiedad del objeto JS del navegador, evitando buscar el atributo literal en el HTML
    expect(input.type).toBe("text");
  });

  test("debe alternar la visibilidad del texto al hacer clic en el botón de contraseña", () => {
    render(<Input data-testid="password-input" placeholder="Tu clave" type="password" />);
    
    const input = screen.getByTestId("password-input");
    expect(input).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();

    // Primer clic: cambia a texto visible
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");

    // Segundo clic: vuelve a ocultar la contraseña
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
  });

  test("debe aplicar las clases correctas de CVA según la variante provista", () => {
    render(<Input data-testid="variant-input" variant="Search" />);
    
    const input = screen.getByTestId("variant-input");
    expect(input).toHaveClass("border", "border-gray-300", "py-[7px]", "pl-8");
  });

  test("debe renderizar los iconos izquierdo y derecho cuando se le pasan por props", () => {
    render(
      <Input 
        iconLeft={<span data-testid="left-icon">L</span>} 
        iconRight={<span data-testid="right-icon">R</span>} 
      />
    );

    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  test("debe respetar el estado deshabilitado (disabled)", () => {
    render(<Input data-testid="disabled-input" disabled placeholder="Bloqueado" />);
    
    const input = screen.getByTestId("disabled-input");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:pointer-events-none", "disabled:opacity-30");
  });
});