import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionRichSnippets } from '../session-rich-snippets';

// Mock de lucide-react - debe ir primero
vi.mock('lucide-react', () => ({
  Clock: ({ size, ...props }: any) => <svg data-testid="clock-icon" width={size} height={size} {...props} />,
  Dumbbell: ({ size, ...props }: any) => <svg data-testid="dumbbell-icon" width={size} height={size} {...props} />,
  Timer: ({ size, ...props }: any) => <svg data-testid="timer-icon" width={size} height={size} {...props} />,
}));

// Mock de useI18n - con una implementación por defecto que funcione
const mockT = vi.fn((key: string, options?: any) => {
  if (key === 'programs.min_short') return 'min';
  if (key === 'programs.exercises') return 'ejercicios';
  if (key === 'programs.set') return options?.count === 1 ? 'serie' : 'series';
  return key;
});

vi.mock('locales/client', () => ({
  useI18n: vi.fn(() => mockT),
}));

import { useI18n } from 'locales/client';

describe('Componente SessionRichSnippets', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockT.mockImplementation((key: string, options?: any) => {
      if (key === 'programs.min_short') return 'min';
      if (key === 'programs.exercises') return 'ejercicios';
      if (key === 'programs.set') return options?.count === 1 ? 'serie' : 'series';
      return key;
    });

    (useI18n as any).mockReturnValue(mockT);
  });

  it('debería renderizar la duración, número de ejercicios y total de series', () => {
    render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={24} />);

    expect(screen.getByText(/45 min/)).toBeInTheDocument();
    expect(screen.getByText(/8 ejercicios/)).toBeInTheDocument();
    expect(screen.getByText(/24 series/)).toBeInTheDocument();
  });

  it('debería mostrar el texto singular para "serie" cuando totalSets es 1', () => {
    mockT.mockImplementation((key: string, options?: any) => {
      if (key === 'programs.min_short') return 'min';
      if (key === 'programs.exercises') return 'ejercicio';
      if (key === 'programs.set') return options?.count === 1 ? 'serie' : 'series';
      return key;
    });

    render(<SessionRichSnippets duration={30} exerciseCount={1} totalSets={1} />);

    expect(screen.getByText(/1 ejercicio/)).toBeInTheDocument();
    expect(screen.getByText(/1 serie/)).toBeInTheDocument();
  });

  it('debería mostrar el texto plural para "series" cuando totalSets es mayor a 1', () => {
    render(<SessionRichSnippets duration={45} exerciseCount={5} totalSets={15} />);

    expect(screen.getByText(/5 ejercicios/)).toBeInTheDocument();
    expect(screen.getByText(/15 series/)).toBeInTheDocument();
  });

  it('debería mostrar el texto plural para "ejercicios" cuando exerciseCount es mayor a 1', () => {
    render(<SessionRichSnippets duration={45} exerciseCount={3} totalSets={10} />);

    expect(screen.getByText(/3 ejercicios/)).toBeInTheDocument();
  });

  it('debería mostrar el prefijo "~" antes de la duración', () => {
    render(<SessionRichSnippets duration={60} exerciseCount={5} totalSets={20} />);

    expect(screen.getByText(/~60 min/)).toBeInTheDocument();
  });

  it('debería renderizar los tres íconos: Clock, Dumbbell y Timer', () => {
    const { container } = render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={24} />);

    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('dumbbell-icon')).toBeInTheDocument();
    expect(screen.getByTestId('timer-icon')).toBeInTheDocument();
    
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(3);
  });

  it('debería aceptar className personalizado', () => {
    const { container } = render(
      <SessionRichSnippets 
        duration={45} 
        exerciseCount={8} 
        totalSets={24} 
        className="snippet-personalizado"
      />
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('snippet-personalizado');
    expect(div).toHaveClass('flex', 'items-center', 'gap-4');
  });

  it('debería tener las clases CSS correctas por defecto', () => {
    const { container } = render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={24} />);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('flex', 'items-center', 'gap-4');
    expect(div).toHaveClass('text-sm', 'text-gray-600', 'dark:text-gray-400');
  });

  it('debería renderizar datos estructurados ocultos para SEO', () => {
    const { container } = render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={24} />);

    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toBeInTheDocument();

    const duration = srOnly?.querySelector('[itemprop="duration"]');
    expect(duration).toBeInTheDocument();
    expect(duration).toHaveTextContent('45');

    const exerciseCount = srOnly?.querySelector('[itemprop="exerciseCount"]');
    expect(exerciseCount).toBeInTheDocument();
    expect(exerciseCount).toHaveTextContent('8');

    const workoutSets = srOnly?.querySelector('[itemprop="workoutSets"]');
    expect(workoutSets).toBeInTheDocument();
    expect(workoutSets).toHaveTextContent('24');
  });

  it('debería manejar valores de duración cero', () => {
    render(<SessionRichSnippets duration={0} exerciseCount={0} totalSets={0} />);

    expect(screen.getByText(/~0 min/)).toBeInTheDocument();
    expect(screen.getByText(/0 ejercicios/)).toBeInTheDocument();
    expect(screen.getByText(/0 series/)).toBeInTheDocument();
  });

  it('debería manejar valores grandes sin errores', () => {
    render(<SessionRichSnippets duration={999} exerciseCount={999} totalSets={999} />);

    expect(screen.getByText(/~999 min/)).toBeInTheDocument();
    expect(screen.getByText(/999 ejercicios/)).toBeInTheDocument();
    expect(screen.getByText(/999 series/)).toBeInTheDocument();
  });

  it('debería tener el tamaño correcto en los íconos', () => {
    render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={24} />);

    const clockIcon = screen.getByTestId('clock-icon');
    const dumbbellIcon = screen.getByTestId('dumbbell-icon');
    const timerIcon = screen.getByTestId('timer-icon');
    
    expect(clockIcon).toHaveAttribute('width', '16');
    expect(dumbbellIcon).toHaveAttribute('width', '16');
    expect(timerIcon).toHaveAttribute('width', '16');
  });

  it('debería tener la estructura semántica correcta', () => {
    const { container } = render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={24} />);

    const items = container.querySelectorAll('.flex.items-center.gap-1');
    expect(items).toHaveLength(3);
  });

  it('debería llamar a useI18n correctamente', () => {
    render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={24} />);

    expect(useI18n).toHaveBeenCalledTimes(1);
  });

  it('debería usar las traducciones correctas para cada clave', () => {
    const testMockT = vi.fn((key: string, options?: any) => {
      if (key === 'programs.min_short') return 'min';
      if (key === 'programs.exercises') return 'ejercicios';
      if (key === 'programs.set') return options?.count === 1 ? 'serie' : 'series';
      return key;
    });
    
    (useI18n as any).mockReturnValue(testMockT);

    render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={24} />);

    expect(testMockT).toHaveBeenCalledWith('programs.min_short');
    expect(testMockT).toHaveBeenCalledWith('programs.exercises');
    expect(testMockT).toHaveBeenCalledWith('programs.set', { count: 24 });
  });

  it('debería pasar el count correcto a la traducción de "set"', () => {
    const testMockT = vi.fn((key: string, options?: any) => {
      if (key === 'programs.set') return options?.count === 1 ? 'serie' : 'series';
      return key;
    });
    
    (useI18n as any).mockReturnValue(testMockT);

    render(<SessionRichSnippets duration={45} exerciseCount={8} totalSets={5} />);

    expect(testMockT).toHaveBeenCalledWith('programs.set', { count: 5 });
  });
});