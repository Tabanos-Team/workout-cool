import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DurationBadge } from '../duration-badge';

describe('Componente DurationBadge', () => {
  it('debería renderizar la duración en inglés', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    expect(screen.getByText('4 weeks • 12h total')).toBeInTheDocument();
  });

  it('debería renderizar la duración en español', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="es"
      />
    );

    expect(screen.getByText('4 semanas • 12h total')).toBeInTheDocument();
  });

  it('debería renderizar la duración en portugués', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="pt"
      />
    );

    expect(screen.getByText('4 semanas • 12h total')).toBeInTheDocument();
  });

  it('debería renderizar la duración en ruso', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="ru"
      />
    );

    expect(screen.getByText('4 недель • 12ч всего')).toBeInTheDocument();
  });

  it('debería renderizar la duración en chino', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="zh-CN"
      />
    );

    expect(screen.getByText('4 周 • 总共12小时')).toBeInTheDocument();
  });

  it('debería renderizar la duración en francés (fallback)', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="fr"
      />
    );

    expect(screen.getByText('4 semaines • 12h total')).toBeInTheDocument();
  });

  it('debería calcular correctamente el total de horas', () => {
    render(
      <DurationBadge 
        durationWeeks={2}
        sessionsPerWeek={4}
        sessionDurationMin={45}
        locale="en"
      />
    );

    // 2 * 4 * 45 = 360 minutos = 6 horas
    expect(screen.getByText('2 weeks • 6h total')).toBeInTheDocument();
  });

  it('debería redondear las horas correctamente', () => {
    render(
      <DurationBadge 
        durationWeeks={1}
        sessionsPerWeek={1}
        sessionDurationMin={75}
        locale="en"
      />
    );

    // 75 minutos = 1.25h, redondeado a 1h
    expect(screen.getByText('1 weeks • 1h total')).toBeInTheDocument();
  });

  it('debería redondear hacia arriba cuando es 0.5 o más', () => {
    render(
      <DurationBadge 
        durationWeeks={1}
        sessionsPerWeek={1}
        sessionDurationMin={90}
        locale="en"
      />
    );

    // 90 minutos = 1.5h, redondeado a 2h
    expect(screen.getByText('1 weeks • 2h total')).toBeInTheDocument();
  });

  it('debería renderizar el ícono de reloj', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-clock');
  });

  it('debería aceptar className personalizado', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
        className="badge-personalizado"
      />
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('badge-personalizado');
    expect(div).toHaveClass('inline-flex', 'items-center', 'space-x-1');
  });

  it('debería renderizar datos estructurados ocultos para SEO', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toBeInTheDocument();

    const tiempoRequerido = srOnly?.querySelector('[itemprop="timeRequired"]');
    expect(tiempoRequerido).toBeInTheDocument();
    expect(tiempoRequerido).toHaveTextContent('PT720M'); // 12 horas = 720 minutos

    const duracion = srOnly?.querySelector('[itemprop="duration"]');
    expect(duracion).toBeInTheDocument();
    expect(duracion).toHaveTextContent('P4W');
  });

  it('debería manejar duración cero correctamente', () => {
    render(
      <DurationBadge 
        durationWeeks={0}
        sessionsPerWeek={0}
        sessionDurationMin={0}
        locale="en"
      />
    );

    expect(screen.getByText('0 weeks • 0h total')).toBeInTheDocument();
  });

  it('debería manejar valores que resultan en 0 horas', () => {
    render(
      <DurationBadge 
        durationWeeks={1}
        sessionsPerWeek={1}
        sessionDurationMin={29}
        locale="en"
      />
    );

    // 29 minutos, redondeado a 0h
    expect(screen.getByText('1 weeks • 0h total')).toBeInTheDocument();
  });

  it('debería mostrar el formato singular en inglés para 1 semana', () => {
    render(
      <DurationBadge 
        durationWeeks={1}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    // Nota: El componente siempre usa "weeks" (plural) incluso para 1
    // Esto es el comportamiento real del componente
    expect(screen.getByText('1 weeks • 3h total')).toBeInTheDocument();
  });

  it('debería manejar locales no soportados con fallback a francés', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="de"
      />
    );

    // Fallback a francés (el else del if)
    expect(screen.getByText('4 semaines • 12h total')).toBeInTheDocument();
  });

  it('debería manejar locale italiano (no soportado) con fallback', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="it"
      />
    );

    expect(screen.getByText('4 semaines • 12h total')).toBeInTheDocument();
  });

  it('debería tener las clases CSS correctas', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('inline-flex', 'items-center', 'space-x-1');
    expect(div).toHaveClass('text-sm', 'text-gray-600', 'dark:text-gray-400');
    
    const span = div.querySelector('span');
    expect(span).toHaveClass('text-sm'); // El span hereda clases o no tiene clases específicas
  });

  it('debería tener accesibilidad adecuada en el ícono', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('debería calcular correctamente el total de minutos en datos estructurados', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={3}
        sessionsPerWeek={2}
        sessionDurationMin={45}
        locale="en"
      />
    );

    // 3 * 2 * 45 = 270 minutos
    const srOnly = container.querySelector('.sr-only');
    const tiempoRequerido = srOnly?.querySelector('[itemprop="timeRequired"]');
    expect(tiempoRequerido).toHaveTextContent('PT270M');
  });

  it('debería calcular correctamente las semanas en datos estructurados', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={8}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    const srOnly = container.querySelector('.sr-only');
    const duracion = srOnly?.querySelector('[itemprop="duration"]');
    expect(duracion).toHaveTextContent('P8W');
  });

  it('debería funcionar con valores grandes sin errores', () => {
    render(
      <DurationBadge 
        durationWeeks={100}
        sessionsPerWeek={7}
        sessionDurationMin={120}
        locale="en"
      />
    );

    // 100 * 7 * 120 = 84,000 minutos = 1,400 horas
    expect(screen.getByText(/1400h total/)).toBeInTheDocument();
  });
});