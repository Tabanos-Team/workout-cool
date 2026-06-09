import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  InlineTooltip 
} from "./tooltip"; 

describe("Componentes Atómicos de Tooltip (Radix)", () => {
  it("debería aplicar las clases base de animación y estilos al TooltipContent", async () => {
    render(
      <Tooltip open={true}>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent data-testid="tooltip-content" className="clase-personalizada">
          Contenido Atómico
        </TooltipContent>
      </Tooltip>
    );

    const content = await screen.findByTestId("tooltip-content");
    expect(content).toBeInTheDocument();
    expect(content.className).toContain("clase-personalizada");
    expect(content.className).toContain("bg-popover");
  });
});

describe("Componente InlineTooltip", () => {
  it("debería renderizar el trigger (texto plano) y mostrar el tooltip", () => {
    render(
      <InlineTooltip title="Mensaje de Ayuda" delayDuration={0}>
        Texto disparador
      </InlineTooltip>
    );
    expect(screen.getByText("Texto disparador")).toBeInTheDocument();
  });

  it("debería renderizar un elemento hijo complejo cuando asChild es true", () => {
    render(
      <InlineTooltip title="Mensaje de Ayuda" delayDuration={0}>
        <button data-testid="btn-trigger">Botón Disparador</button>
      </InlineTooltip>
    );
    expect(screen.getByTestId("btn-trigger")).toBeInTheDocument();
  });

  it("debería mostrar el contenido del tooltip al pasar el mouse por encima (Simulación con fireEvent)", async () => {
    render(
      <InlineTooltip title="Este es el título secreto" delayDuration={0}>
        <span>Pasa el cursor aquí</span>
      </InlineTooltip>
    );

    // 1. Verificamos que inicialmente no esté (usando queryByText ya que no arroja error si hay 0 coincidencias)
    expect(screen.queryByText("Este es el título secreto")).not.toBeInTheDocument();

    const trigger = screen.getByText("Pasa el cursor aquí");
    
    // 2. Disparamos la apertura interactiva en JSDOM
    fireEvent.pointerEnter(trigger);
    fireEvent.focus(trigger);

    // 3. Capturamos el arreglo de elementos duplicados por el portal con findAllByText
    const tooltipElements = await screen.findAllByText("Este es el título secreto");
    
    // 4. Evaluamos el primer elemento válido encontrado
    const mainTooltip = tooltipElements[0];
    expect(mainTooltip).toBeInTheDocument();
    expect(mainTooltip.className).toContain("text-center");
  });
});