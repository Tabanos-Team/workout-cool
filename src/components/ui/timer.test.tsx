import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Timer } from "./timer";

describe("Pruebas Unitarias - Componente Timer", () => {
  
  beforeEach(() => {
    // Activamos el uso de temporizadores simulados/falsos antes de cada test
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Limpiamos los temporizadores y restauramos el reloj nativo
    vi.restoreAllMocks();
  });

  test("debe renderizar el formato inicial mm:ss por defecto (00:00)", () => {
    render(<Timer isRunning={false} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  test("debe aceptar un valor inicial de segundos y formatearlo correctamente", () => {
    // 90 segundos = 01:30
    render(<Timer initialSeconds={90} isRunning={false} />);
    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  test("debe cambiar al formato hh:mm:ss si el tiempo supera una hora", () => {
    // 3665 segundos = 01:01:05 (1 hora, 1 minuto, 5 segundos)
    render(<Timer initialSeconds={3665} isRunning={false} />);
    expect(screen.getByText("01:01:05")).toBeInTheDocument();
  });

  test("debe incrementar el tiempo cada segundo y disparar onChange cuando isRunning es true", () => {
    const handleChange = vi.fn();
    render(<Timer initialSeconds={0} isRunning={true} onChange={handleChange} />);

    expect(screen.getByText("00:00")).toBeInTheDocument();

    // Avanzamos el reloj virtual 1 segundo
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("00:01")).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(1);

    // Avanzamos 2 segundos más (total 3)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("00:03")).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  test("debe pausar el incremento del temporizador cuando isRunning cambia a false", () => {
    const { rerender } = render(<Timer initialSeconds={10} isRunning={true} />);
    
    expect(screen.getByText("00:10")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("00:11")).toBeInTheDocument();

    // Cambiamos la prop para pausar el componente
    rerender(<Timer initialSeconds={10} isRunning={false} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // El tiempo no debe haberse movido de su último estado renderizado estable
    expect(screen.getByText("00:11")).toBeInTheDocument();
  });

  test("debe reiniciar o actualizar los segundos si la propiedad initialSeconds muta externamente", () => {
    const { rerender } = render(<Timer initialSeconds={5} isRunning={false} />);
    expect(screen.getByText("00:05")).toBeInTheDocument();

    // Forzamos actualización externa de la base de tiempo inicial
    rerender(<Timer initialSeconds={45} isRunning={false} />);
    expect(screen.getByText("00:45")).toBeInTheDocument();
  });

  test("debe limpiar el intervalo nativo de la memoria al desmontar el componente", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = render(<Timer initialSeconds={0} isRunning={true} />);

    unmount();

    // Valida que el efecto de retorno limpie el hilo para evitar pérdidas de memoria (memory leaks)
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});