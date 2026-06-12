import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// 1. Mock preventivo de ResizeObserver para evitar colapsos por dependencias de Radix UI
beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

// 2. Mock de lucide-react para el icono Circle
vi.mock("lucide-react", () => ({
  Circle: ({ className }: { className?: string }) => (
    <span className={className} data-testid="lucide-circle" />
  ),
}));

// 3. Mock del icono SVG personalizado
vi.mock("@/components/svg/IconCheckboxCheck", () => ({
  __esModule: true,
  default: ({ className }: { className?: string }) => (
    <span className={className} data-testid="custom-check-icon" />
  ),
}));

import { RadioGroup, RadioGroupItem, RadioGroupCheck } from "./radio-group";

describe("Pruebas Unitarias - Componente RadioGroup", () => {
  
  test("debe renderizar la lista de opciones y permitir cambiar la selección mediante clics", () => {
    render(
      <RadioGroup defaultValue="opcion-1">
        <RadioGroupItem data-testid="item-1" value="opcion-1" />
        <RadioGroupItem data-testid="item-2" value="opcion-2" />
      </RadioGroup>
    );

    const item1 = screen.getByTestId("item-1");
    const item2 = screen.getByTestId("item-2");

    // Verificar estado inicial basado en defaultValue
    expect(item1).toHaveAttribute("data-state", "checked");
    expect(item2).toHaveAttribute("data-state", "unchecked");

    // Simular cambio de opción haciendo clic en la segunda alternativa
    fireEvent.click(item2);

    expect(item1).toHaveAttribute("data-state", "unchecked");
    expect(item2).toHaveAttribute("data-state", "checked");
  });

  test("debe aplicar correctamente las variantes de CVA (variant y color) a RadioGroupItem", () => {
    render(
      <RadioGroup defaultValue="danger-opt">
        <RadioGroupItem 
          color="danger" 
          data-testid="item-danger" 
          value="danger-opt" 
          variant="outline" 
        />
      </RadioGroup>
    );

    const item = screen.getByTestId("item-danger");
    
    // Validamos que se inyecten las clases de variante definidas en el CVA del archivo original
    expect(item).toHaveClass("data-[state=checked]:!bg-white");
    expect(item).toHaveClass("data-[state=checked]:ring-danger");
  });

  test("debe renderizar la variante alternativa RadioGroupCheck con su icono SVG personalizado", () => {
    render(
      <RadioGroup defaultValue="check-1">
        <RadioGroupCheck data-testid="radio-check" value="check-1" />
      </RadioGroup>
    );

    const radioCheck = screen.getByTestId("radio-check");
    expect(radioCheck).toBeInTheDocument();
    
    // Verificamos las clases estáticas específicas definidas en RadioGroupCheck
    expect(radioCheck).toHaveClass("data-[state=checked]:bg-black", "border-gray-300");

    // Al estar seleccionado, el Indicator debe renderizar nuestro componente SVG personalizado
    const customIcon = screen.getByTestId("custom-check-icon");
    expect(customIcon).toBeInTheDocument();
    expect(customIcon).toHaveClass("size-1.5");
  });

  test("debe respetar el estado deshabilitado (disabled) impidiendo interactividad y aplicando opacidad", () => {
    render(
      <RadioGroup defaultValue="1">
        <RadioGroupItem data-testid="active-item" value="1" />
        <RadioGroupItem data-testid="disabled-item" disabled value="2" />
      </RadioGroup>
    );

    const activeItem = screen.getByTestId("active-item");
    const disabledItem = screen.getByTestId("disabled-item");

    expect(disabledItem).toBeDisabled();
    expect(disabledItem).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-40");

    // Intentamos hacer clic en la opción deshabilitada
    fireEvent.click(disabledItem);

    // El foco y la selección no deben cambiar debido al bloqueo nativo
    expect(activeItem).toHaveAttribute("data-state", "checked");
    expect(disabledItem).toHaveAttribute("data-state", "unchecked");
  });

  test("debe concatenar clases personalizadas externas utilizando la función cn", () => {
    render(
      <RadioGroup className="custom-group-layout">
        <RadioGroupItem className="custom-item-style" data-testid="item" value="1" />
      </RadioGroup>
    );

    expect(screen.getByRole("radiogroup")).toHaveClass("grid", "gap-4", "custom-group-layout");
    expect(screen.getByTestId("item")).toHaveClass("custom-item-style");
  });
});