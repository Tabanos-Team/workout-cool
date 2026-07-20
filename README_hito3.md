# Hito 3 - Trabajo Final: Entregables y Artefactos

Este archivo describe la ubicación y el propósito de cada uno de los artefactos generados para la entrega final del Hito 3 en la plataforma **Workout Cool**.

---

## 📋 Resumen de Artefactos de Entrega

### 1. Repositorio del Proyecto
* **URL:** [Tabanos-Team/workout-cool](https://github.com/Tabanos-Team/workout-cool)
* **Rama Principal:** `main`

### 2. Automatización CI/CD (GitHub Actions)
* **Ubicación:** [.github/workflows/ci.yml](https://github.com/Tabanos-Team/workout-cool/blob/main/.github/workflows/ci.yml)
* **Historial de Ejecución:** [GitHub Actions Runs](https://github.com/Tabanos-Team/workout-cool/actions)
* **Descripción:** Pipeline automático que valida linting, ejecuta las pruebas unitarias con reporte de cobertura, corre la suite de integración y ejecuta los escenarios de extremo a extremo (E2E) con Playwright.

### 3. Entorno de Calidad (QA Vercel)
* **URL del Sitio QA:** [Workout Cool - QA](https://workout-cool-ten.vercel.app/)
* **Descripción:** Despliegue automático de la aplicación integrada con base de datos Neon PostgreSQL.

### 4. Pruebas Unitarias y Cobertura
* **Ubicación del Código:** [src/test/](file:///d:/2026-A/TEORIA/PS/hito3/workout-cool/src/test/)
* **Descripción:** Suite de 509 casos unitarios ejecutados mediante Vitest y React Testing Library. La cobertura supera el 85% en todas las métricas (statements, branches, functions y lines).

### 5. Pruebas de Integración y Seguridad
* **Ubicación del Código:** [src/test/integration/](file:///d:/2026-A/TEORIA/PS/hito3/workout-cool/src/test/integration/)
* **Archivos Clave:**
  * [security.integration.test.ts](file:///d:/2026-A/TEORIA/PS/hito3/workout-cool/src/test/integration/security.integration.test.ts): Control de accesos y barreras de autenticación (retornos de 401).
  * [workout-sessions-extended.integration.test.ts](file:///d:/2026-A/TEORIA/PS/hito3/workout-cool/src/test/integration/workout-sessions-extended.integration.test.ts): Pruebas de feedback, eliminación real en base de datos y estadísticas premium.
* **Colección Bruno:** Ubicada en la carpeta `/workout-cool-postman` para pruebas directas contra la API de QA en Vercel.

### 6. Pruebas E2E (Playwright)
* **Ubicación del Código:** [e2e/](file:///d:/2026-A/TEORIA/PS/hito3/workout-cool/e2e/)
* **Descripción:** 28 casos automatizados que simulan flujos reales de navegación pública y autenticada en Chrome para escritorio y emulación móvil (Pixel 5).

### 7. Documentación y Evidencias (Wiki)
* **URL:** [GitHub Wiki](https://github.com/Tabanos-Team/workout-cool/wiki)
* **Descripción:** Página de la Wiki que documenta el progreso de las pruebas de integración, cobertura de endpoints y capturas de pantalla de los pipelines en GitHub Actions.
