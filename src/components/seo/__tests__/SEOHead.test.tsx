// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { generateSEOMetadata, SEOScripts } from '../SEOHead';
import { SiteConfig } from '@/shared/config/site-config';

// Mocks
vi.mock('@/shared/lib/server-url', () => ({
  getServerUrl: vi.fn(() => 'https://test.workout.cool'),
}));

vi.mock('@/shared/lib/structured-data', () => ({
  generateStructuredData: vi.fn((params) => ({
    '@context': 'https://schema.org',
    '@type': params.type,
    ...params,
  })),
  StructuredDataScript: ({ data }: any) => (
    <script type="application/ld+json" data-testid="structured-data">
      {JSON.stringify(data)}
    </script>
  ),
}));

vi.mock('@/shared/config/site-config', () => ({
  SiteConfig: {
    title: 'Workout Cool',
    description: 'Plataforma de fitness y entrenamiento',
    keywords: ['fitness', 'entrenamiento', 'ejercicio'],
    seo: {
      ogImage: {
        width: 1200,
        height: 630,
      },
      twitterHandle: '@workoutcool',
    },
  },
}));

describe('Función generateSEOMetadata', () => {
  it('debería generar metadatos básicos correctamente', () => {
    const metadata = generateSEOMetadata({
      title: 'Mi Página',
      description: 'Descripción personalizada',
    });

    expect(metadata.title).toBe('Mi Página');
    expect(metadata.description).toBe('Descripción personalizada');
    expect(metadata.robots).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    });
  });

  it('debería usar los valores por defecto del sitio cuando no se proporcionan', () => {
    const metadata = generateSEOMetadata({});

    expect(metadata.title).toBe(SiteConfig.title);
    expect(metadata.description).toBe(SiteConfig.description);
    expect(metadata.keywords).toContain('fitness');
    expect(metadata.keywords).toContain('entrenamiento');
    expect(metadata.keywords).toContain('ejercicio');
  });

  it('debería combinar las keywords del sitio con las proporcionadas', () => {
    const metadata = generateSEOMetadata({
      keywords: ['keyword1', 'keyword2'],
    });

    expect(metadata.keywords).toContain('fitness');
    expect(metadata.keywords).toContain('keyword1');
    expect(metadata.keywords).toContain('keyword2');
    expect(metadata.keywords?.length).toBe(5);
  });

  it('debería configurar noIndex correctamente', () => {
    const metadata = generateSEOMetadata({ noIndex: true });

    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it('debería generar la URL canónica correctamente', () => {
    const metadata = generateSEOMetadata({
      canonical: 'https://custom.url/pagina',
    });

    expect(metadata.alternates?.canonical).toBe('https://custom.url/pagina');
  });

  it('debería usar la URL base cuando no hay canonical proporcionada', () => {
    const metadata = generateSEOMetadata({});

    expect(metadata.alternates?.canonical).toBe('https://test.workout.cool');
  });

  it('debería generar los idiomas alternativos correctamente', () => {
    const metadata = generateSEOMetadata({});

    expect(metadata.alternates?.languages).toEqual({
      'fr-FR': 'https://test.workout.cool/fr',
      'en-US': 'https://test.workout.cool/en',
      'es-ES': 'https://test.workout.cool/es',
      'pt-PT': 'https://test.workout.cool/pt',
      'ru-RU': 'https://test.workout.cool/ru',
      'zh-CN': 'https://test.workout.cool/zh-CN',
      'x-default': 'https://test.workout.cool',
    });
  });

  it('debería generar OpenGraph con el locale correcto para inglés', () => {
    const metadata = generateSEOMetadata({ locale: 'en' });
    expect(metadata.openGraph?.locale).toBe('en_US');
  });

  it('debería generar OpenGraph con el locale correcto para español', () => {
    const metadata = generateSEOMetadata({ locale: 'es' });
    expect(metadata.openGraph?.locale).toBe('es_ES');
  });

  it('debería generar OpenGraph con el locale correcto para portugués', () => {
    const metadata = generateSEOMetadata({ locale: 'pt' });
    expect(metadata.openGraph?.locale).toBe('pt_PT');
  });

  it('debería generar OpenGraph con el locale correcto para ruso', () => {
    const metadata = generateSEOMetadata({ locale: 'ru' });
    expect(metadata.openGraph?.locale).toBe('ru_RU');
  });

  it('debería generar OpenGraph con el locale correcto para chino', () => {
    const metadata = generateSEOMetadata({ locale: 'zh-CN' });
    expect(metadata.openGraph?.locale).toBe('zh_CN');
  });

  it('debería generar OpenGraph con fallback a francés para locale no soportado', () => {
    const metadata = generateSEOMetadata({ locale: 'de' });
    expect(metadata.openGraph?.locale).toBe('fr_FR');
  });

  it('debería incluir imágenes en OpenGraph con las dimensiones correctas', () => {
    const metadata = generateSEOMetadata({
      title: 'Título para OG',
    });

    expect(metadata.openGraph?.images).toBeDefined();
    expect(metadata.openGraph?.images[0]).toMatchObject({
      url: 'https://test.workout.cool/images/default-og-image_en.jpg',
      width: SiteConfig.seo.ogImage.width,
      height: SiteConfig.seo.ogImage.height,
      alt: 'Título para OG',
    });
  });

  it('debería usar imagen específica para chino en OpenGraph', () => {
    const metadata = generateSEOMetadata({
      locale: 'zh-CN',
    });

    expect(metadata.openGraph?.images[0].url).toBe('https://test.workout.cool/images/default-og-image_zh.jpg');
  });

  it('debería generar metadatos de Twitter correctamente', () => {
    const metadata = generateSEOMetadata({
      title: 'Tweet Title',
      description: 'Tweet description',
    });

    expect(metadata.twitter?.title).toBe('Tweet Title');
    expect(metadata.twitter?.description).toBe('Tweet description');
    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(metadata.twitter?.site).toBe(SiteConfig.seo.twitterHandle);
    expect(metadata.twitter?.creator).toBe(SiteConfig.seo.twitterHandle);
    expect(metadata.twitter?.images[0].url).toBe('https://test.workout.cool/images/default-og-image_en.jpg');
  });

  it('debería usar la imagen OG personalizada cuando se proporciona', () => {
    const metadata = generateSEOMetadata({
      ogImage: 'https://custom.url/image.jpg',
    });

    expect(metadata.openGraph?.images[0].url).toBe('https://custom.url/image.jpg');
    expect(metadata.twitter?.images[0].url).toBe('https://custom.url/image.jpg');
  });

  it('debería manejar ogType "article" correctamente', () => {
    const metadata = generateSEOMetadata({
      ogType: 'article',
    });

    expect(metadata.openGraph?.type).toBe('article');
  });

  it('debería manejar ogType "website" por defecto', () => {
    const metadata = generateSEOMetadata({});

    expect(metadata.openGraph?.type).toBe('website');
  });

  it('debería excluir el locale actual de alternateLocale', () => {
    const metadata = generateSEOMetadata({ locale: 'en' });
    expect(metadata.openGraph?.alternateLocale).not.toContain('en_US');
    expect(metadata.openGraph?.alternateLocale).toContain('es_ES');
    expect(metadata.openGraph?.alternateLocale).toContain('fr_FR');
    expect(metadata.openGraph?.alternateLocale).toContain('pt_PT');
  });

  it('debería incluir múltiples alternateLocales', () => {
    const metadata = generateSEOMetadata({ locale: 'es' });
    
    expect(metadata.openGraph?.alternateLocale?.length).toBeGreaterThan(5);
    expect(metadata.openGraph?.alternateLocale).toContain('en_US');
    expect(metadata.openGraph?.alternateLocale).toContain('fr_CA');
    expect(metadata.openGraph?.alternateLocale).toContain('pt_BR');
    expect(metadata.openGraph?.alternateLocale).toContain('zh_TW');
  });
});

describe('Componente SEOScripts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el script de datos estructurados cuando se proporciona structuredData tipo Article', () => {
    const { getByTestId } = render(
      <SEOScripts
        title="Artículo de prueba"
        structuredData={{
          type: 'Article',
          author: 'Juan Pérez',
          datePublished: '2024-01-01',
          dateModified: '2024-01-02',
        }}
      />
    );

    const script = getByTestId('structured-data');
    expect(script).toBeInTheDocument();
    
    const data = JSON.parse(script.textContent || '');
    expect(data['@type']).toBe('Article');
    expect(data.author).toBe('Juan Pérez');
    expect(data.datePublished).toBe('2024-01-01');
    expect(data.dateModified).toBe('2024-01-02');
  });

  it('debería renderizar script para structuredData tipo SoftwareApplication', () => {
    const { getByTestId } = render(
      <SEOScripts
        title="App de Fitness"
        structuredData={{
          type: 'SoftwareApplication',
        }}
      />
    );

    const script = getByTestId('structured-data');
    const data = JSON.parse(script.textContent || '');
    expect(data['@type']).toBe('SoftwareApplication');
  });

  it('debería renderizar script para structuredData tipo Calculator con datos completos', () => {
    const { getByTestId } = render(
      <SEOScripts
        title="Calculadora de Calorías"
        structuredData={{
          type: 'Calculator',
          calculatorData: {
            calculatorType: 'calorie',
            inputFields: ['edad', 'peso', 'altura'],
            outputFields: ['calorías_diarias'],
            formula: 'Harris-Benedict',
            accuracy: '95%',
            targetAudience: ['deportistas', 'principiantes'],
            relatedCalculators: ['bmi', 'macro'],
          },
        }}
      />
    );

    const script = getByTestId('structured-data');
    const data = JSON.parse(script.textContent || '');
    expect(data['@type']).toBe('Calculator');
    expect(data.calculatorData?.calculatorType).toBe('calorie');
    expect(data.calculatorData?.inputFields).toEqual(['edad', 'peso', 'altura']);
    expect(data.calculatorData?.formula).toBe('Harris-Benedict');
  });

  it('no debería renderizar datos estructurados cuando no se proporcionan', () => {
    const { queryByTestId } = render(<SEOScripts />);
    expect(queryByTestId('structured-data')).not.toBeInTheDocument();
  });

  it('debería generar etiquetas hreflang cuando se proporciona hreflangPath', () => {
    const { container } = render(
      <SEOScripts hreflangPath="/tools/calculadora" />
    );

    const links = container.querySelectorAll('link[rel="alternate"]');
    expect(links).toHaveLength(7);
    
    const hrefLangValues = Array.from(links).map(link => link.getAttribute('hrefLang'));
    expect(hrefLangValues).toContain('en');
    expect(hrefLangValues).toContain('es');
    expect(hrefLangValues).toContain('fr');
    expect(hrefLangValues).toContain('pt');
    expect(hrefLangValues).toContain('ru');
    expect(hrefLangValues).toContain('zh-CN');
    expect(hrefLangValues).toContain('x-default');
  });

  it('no debería generar etiquetas hreflang cuando no se proporciona hreflangPath', () => {
    const { container } = render(<SEOScripts />);
    const links = container.querySelectorAll('link[rel="alternate"]');
    expect(links).toHaveLength(0);
  });

  it('debería generar las URLs correctas para hreflang', () => {
    const { container } = render(
      <SEOScripts hreflangPath="/ejercicios/flexiones" />
    );

    const enLink = container.querySelector('link[hrefLang="en"]');
    expect(enLink).toHaveAttribute('href', 'https://test.workout.cool/en/ejercicios/flexiones');
    
    const esLink = container.querySelector('link[hrefLang="es"]');
    expect(esLink).toHaveAttribute('href', 'https://test.workout.cool/es/ejercicios/flexiones');
    
    const frLink = container.querySelector('link[hrefLang="fr"]');
    expect(frLink).toHaveAttribute('href', 'https://test.workout.cool/fr/ejercicios/flexiones');
    
    const xDefaultLink = container.querySelector('link[hrefLang="x-default"]');
    expect(xDefaultLink).toHaveAttribute('href', 'https://test.workout.cool/en/ejercicios/flexiones');
  });

  it('debería pasar las props correctamente a generateStructuredData', async () => {
    const { generateStructuredData } = await import('@/shared/lib/structured-data');
    
    render(
      <SEOScripts
        title="Mi Título"
        description="Mi Descripción"
        locale="es"
        canonical="https://custom.url"
        ogImage="https://custom.url/og.jpg"
        structuredData={{
          type: 'Article',
          author: 'Autor Test',
          datePublished: '2024-01-01',
        }}
      />
    );

    expect(generateStructuredData).toHaveBeenCalledWith({
      type: 'Article',
      locale: 'es',
      title: 'Mi Título',
      description: 'Mi Descripción',
      url: 'https://custom.url',
      image: 'https://custom.url/og.jpg',
      author: 'Autor Test',
      datePublished: '2024-01-01',
      dateModified: undefined,
      calculatorData: undefined,
    });
  });

  it('debería renderizar los hijos cuando se proporcionan', () => {
    const { getByText } = render(
      <SEOScripts>
        <div data-testid="child-content">Contenido hijo</div>
      </SEOScripts>
    );

    expect(getByText('Contenido hijo')).toBeInTheDocument();
  });

  it('debería manejar hreflangPath vacío como undefined', () => {
    const { container } = render(
      <SEOScripts hreflangPath="">
        <div>Hijo</div>
      </SEOScripts>
    );

    const links = container.querySelectorAll('link[rel="alternate"]');
    expect(links).toHaveLength(0);
    expect(container).toBeInTheDocument();
  });

  it('debería usar la URL base para canonical cuando no se proporciona', async () => {
    const { generateStructuredData } = await import('@/shared/lib/structured-data');
    
    render(
      <SEOScripts
        structuredData={{ type: 'Article' }}
      />
    );

    expect(generateStructuredData).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://test.workout.cool',
      })
    );
  });

  it('debería usar la imagen OG por defecto según el locale', async () => {
    const { generateStructuredData } = await import('@/shared/lib/structured-data');
    
    render(
      <SEOScripts
        locale="es"
        structuredData={{ type: 'Article' }}
      />
    );

    expect(generateStructuredData).toHaveBeenCalledWith(
      expect.objectContaining({
        image: 'https://test.workout.cool/images/default-og-image_es.jpg',
      })
    );
  });
});

describe('Integración de generateSEOMetadata y SEOScripts', () => {
  it('debería mantener consistencia en los metadatos entre ambas funciones', () => {
    const props = {
      title: 'Página Integrada',
      description: 'Descripción integrada',
      locale: 'es' as const,
      canonical: 'https://test.workout.cool/integrado',
      ogImage: 'https://test.workout.cool/og-integrado.jpg',
    };

    const metadata = generateSEOMetadata(props);
    
    expect(metadata.title).toBe(props.title);
    expect(metadata.description).toBe(props.description);
    expect(metadata.alternates?.canonical).toBe(props.canonical);
    expect(metadata.openGraph?.locale).toBe('es_ES');
    expect(metadata.openGraph?.images[0].url).toBe(props.ogImage);
  });
});