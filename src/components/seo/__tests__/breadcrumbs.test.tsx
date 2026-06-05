import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../breadcrumbs';

// Mock de StructuredDataScript
vi.mock('@/shared/lib/structured-data', () => ({
  StructuredDataScript: ({ data }: any) => (
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  ),
}));

describe('Breadcrumbs Component', () => {
  it('should render breadcrumb items with correct labels', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Exercises', href: '/exercises' },
      { label: 'Push-ups', current: true },
    ];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Exercises')).toBeInTheDocument();
    expect(screen.getByText('Push-ups')).toBeInTheDocument();
  });

  it('should render links for items with href', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current Page', current: true },
    ];

    render(<Breadcrumbs items={items} />);

    const homeLink = screen.getByRole('link');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should not render as link for current page', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current', current: true },
    ];

    render(<Breadcrumbs items={items} />);

    const currentPage = screen.getByText('Current');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('should render Home icon for first item', () => {
    const items = [{ label: 'Home', href: '/' }];

    const { container } = render(<Breadcrumbs items={items} />);

    // Verifica que el ícono de Home está presente
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have proper navigation accessibility', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Exercises', href: '/exercises' },
    ];

    render(<Breadcrumbs items={items} />);

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();
  });

  it('should generate BreadcrumbList structured data', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Exercises', href: '/exercises' },
      { label: 'Push-ups', href: '/exercises/push-ups' },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    if (script?.textContent) {
      const data = JSON.parse(script.textContent);
      expect(data['@type']).toBe('BreadcrumbList');
      expect(data.itemListElement).toHaveLength(3);
      expect(data.itemListElement[0].position).toBe(1);
      expect(data.itemListElement[1].position).toBe(2);
    }
  });

  it('should include URLs in structured data when href exists', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current', current: true },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    if (script?.textContent) {
      const data = JSON.parse(script.textContent);
      expect(data.itemListElement[0].item).toContain('https://www.workout.cool');
      expect(data.itemListElement[1].item).toBeUndefined(); // Sin href, sin URL
    }
  });

  it('should render separator between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Exercises', href: '/exercises' },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    // Busca los ícones de separador (ChevronRight)
    const chevrons = container.querySelectorAll('svg');
    expect(chevrons.length).toBeGreaterThan(1); // Al menos uno para el separador
  });
});