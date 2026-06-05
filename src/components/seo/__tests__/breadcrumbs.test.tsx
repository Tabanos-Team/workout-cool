import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../breadcrumbs';

// Mock de StructuredDataScript
vi.mock('@/shared/lib/structured-data', () => ({
  StructuredDataScript: ({ data }: any) => (
    <script type="application/ld+json" data-testid="structured-data">
      {JSON.stringify(data)}
    </script>
  ),
}));

describe('Componente Breadcrumbs', () => {
  it('debería renderizar elementos de ruta de navegación con etiquetas correctas', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Ejercicios', href: '/ejercicios' },
      { label: 'Flexiones', current: true },
    ];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Ejercicios')).toBeInTheDocument();
    expect(screen.getByText('Flexiones')).toBeInTheDocument();
  });

  it('debería renderizar enlaces para elementos con href', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Página actual', current: true },
    ];

    render(<Breadcrumbs items={items} />);

    const enlaces = screen.getAllByRole('link');
    expect(enlaces.length).toBe(1); // Solo Inicio tiene href
    expect(enlaces[0]).toHaveAttribute('href', '/');
  });

  it('no debería renderizar como enlace la página actual', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Actual', current: true },
    ];

    render(<Breadcrumbs items={items} />);

    const paginaActual = screen.getByText('Actual');
    expect(paginaActual).toHaveAttribute('aria-current', 'page');
    expect(paginaActual.tagName).not.toBe('A');
  });

  it('debería mostrar el ícono de Home solo para el primer elemento', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Ejercicios', href: '/ejercicios' },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    const svgs = container.querySelectorAll('svg');
    // Debería haber un ícono Home y un ChevronRight como separador
    expect(svgs.length).toBe(2);
    
    // El primer svg debería ser el de Home (dentro del primer link)
    const primerSvg = svgs[0];
    expect(primerSvg).toHaveClass('lucide-home');
  });

  it('debería tener accesibilidad de navegación apropiada', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Ejercicios', href: '/ejercicios' },
    ];

    render(<Breadcrumbs items={items} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('debería generar datos estructurados BreadcrumbList', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Ejercicios', href: '/ejercicios' },
      { label: 'Flexiones', href: '/ejercicios/flexiones' },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    if (script?.textContent) {
      const datos = JSON.parse(script.textContent);
      expect(datos['@context']).toBe('https://schema.org');
      expect(datos['@type']).toBe('BreadcrumbList');
      expect(datos.itemListElement).toHaveLength(3);
      
      expect(datos.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://www.workout.cool/',
      });
      
      expect(datos.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Ejercicios',
        item: 'https://www.workout.cool/ejercicios',
      });
    }
  });

  it('debería incluir URLs en datos estructurados solo cuando existe href', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Página actual', current: true },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    if (script?.textContent) {
      const datos = JSON.parse(script.textContent);
      expect(datos.itemListElement[0].item).toBe('https://www.workout.cool/');
      expect(datos.itemListElement[1].item).toBeUndefined();
    }
  });

  it('debería renderizar separador (ChevronRight) entre elementos', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Ejercicios', href: '/ejercicios' },
      { label: 'Flexiones', current: true },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    const chevrones = container.querySelectorAll('.lucide-chevron-right');
    // Debería haber 2 separadores (entre los 3 elementos)
    expect(chevrones.length).toBe(2);
  });

  it('debería manejar elementos sin href y que no son current', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Elemento sin enlace', current: false },
    ];

    render(<Breadcrumbs items={items} />);
    
    const elementoSinEnlace = screen.getByText('Elemento sin enlace');
    expect(elementoSinEnlace).toBeInTheDocument();
    expect(elementoSinEnlace.closest('a')).not.toBeInTheDocument();
    expect(elementoSinEnlace.tagName).toBe('SPAN');
  });

  it('debería aplicar clases específicas al elemento actual', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Actual', current: true },
    ];

    render(<Breadcrumbs items={items} />);
    
    const elementoActual = screen.getByText('Actual');
    expect(elementoActual).toHaveClass('font-medium');
    expect(elementoActual).toHaveClass('text-gray-900');
  });

  it('debería manejar lista vacía de elementos sin errores', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    const lista = container.querySelector('ol');
    expect(lista?.children.length).toBe(0);
  });

  it('debería aplicar estilos condicionales al texto del link según el índice', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Ejercicios', href: '/ejercicios' },
    ];

    const { container } = render(<Breadcrumbs items={items} />);
    
    const enlaces = container.querySelectorAll('a');
    const primerEnlace = enlaces[0];
    const segundoEnlace = enlaces[1];
    
    // Primer enlace debería tener un span con flex para el ícono
    const primerSpan = primerEnlace.querySelector('span');
    expect(primerSpan).toHaveClass('flex', 'items-center');
    
    // Segundo enlace no debería tener el span con flex
    const segundoSpan = segundoEnlace.querySelector('span');
    expect(segundoSpan).toBeNull();
  });

  it('debería tener las clases CSS correctas para responsive', () => {
    const items = [{ label: 'Inicio', href: '/' }];
    
    const { container } = render(<Breadcrumbs items={items} />);
    
    const lista = container.querySelector('ol');
    expect(lista).toHaveClass('space-x-1', 'sm:space-x-2');
    expect(lista).toHaveClass('text-xs');
    expect(lista).toHaveClass('whitespace-nowrap');
  });

  it('debería generar datos estructurados incluso con un solo elemento', () => {
    const items = [{ label: 'Inicio', href: '/' }];
    
    const { container } = render(<Breadcrumbs items={items} />);
    
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    
    if (script?.textContent) {
      const datos = JSON.parse(script.textContent);
      expect(datos.itemListElement).toHaveLength(1);
      expect(datos.itemListElement[0].position).toBe(1);
    }
  });

  it('no debería mostrar separador si solo hay un elemento', () => {
    const items = [{ label: 'Inicio', href: '/' }];
    
    const { container } = render(<Breadcrumbs items={items} />);
    
    const chevrones = container.querySelectorAll('.lucide-chevron-right');
    expect(chevrones.length).toBe(0);
  });
});