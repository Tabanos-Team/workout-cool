import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DurationBadge } from '../duration-badge';

describe('DurationBadge Component', () => {
  it('should render duration in English', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    expect(screen.getByText(/4 weeks • 12h total/)).toBeInTheDocument();
  });

  it('should render duration in Spanish', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="es"
      />
    );

    expect(screen.getByText(/4 semanas • 12h total/)).toBeInTheDocument();
  });

  it('should render duration in French', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="fr"
      />
    );

    expect(screen.getByText(/4 semaines • 12h total/)).toBeInTheDocument();
  });

  it('should render duration in Portuguese', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="pt"
      />
    );

    expect(screen.getByText(/4 semanas • 12h total/)).toBeInTheDocument();
  });

  it('should render duration in Russian', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="ru"
      />
    );

    expect(screen.getByText(/4 недель • 12ч всего/)).toBeInTheDocument();
  });

  it('should render duration in Chinese', () => {
    render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="zh-CN"
      />
    );

    expect(screen.getByText(/4 周 • 总共12小时/)).toBeInTheDocument();
  });

  it('should calculate total hours correctly', () => {
    render(
      <DurationBadge 
        durationWeeks={2}
        sessionsPerWeek={4}
        sessionDurationMin={45}
        locale="en"
      />
    );

    // 2 weeks * 4 sessions * 45 min = 360 min = 6h
    expect(screen.getByText(/2 weeks • 6h total/)).toBeInTheDocument();
  });

  it('should round hours correctly', () => {
    render(
      <DurationBadge 
        durationWeeks={1}
        sessionsPerWeek={1}
        sessionDurationMin={75}
        locale="en"
      />
    );

    // 75 minutes = 1.25h, rounded to 1h
    expect(screen.getByText(/1 weeks • 1h total/)).toBeInTheDocument();
  });

  it('should render Clock icon', () => {
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
  });

  it('should accept custom className', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
        className="custom-badge"
      />
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('custom-badge');
  });

  it('should render hidden structured data for SEO', () => {
    const { container } = render(
      <DurationBadge 
        durationWeeks={4}
        sessionsPerWeek={3}
        sessionDurationMin={60}
        locale="en"
      />
    );

    // Busca los elementos de structured data
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toBeInTheDocument();

    const timeRequired = container.querySelector('[itemprop="timeRequired"]');
    expect(timeRequired).toHaveTextContent('PT720M'); // 12 hours = 720 minutes

    const duration = container.querySelector('[itemprop="duration"]');
    expect(duration).toHaveTextContent('P4W'); // 4 weeks
  });

  it('should handle zero duration gracefully', () => {
    render(
      <DurationBadge 
        durationWeeks={0}
        sessionsPerWeek={0}
        sessionDurationMin={0}
        locale="en"
      />
    );

    expect(screen.getByText(/0 weeks • 0h total/)).toBeInTheDocument();
  });
});