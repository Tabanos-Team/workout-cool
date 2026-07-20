
# CURSO: PRUEBAS DE SOFTWARE
## HITO 3 – TRABAJO FINAL (ENTREGA FINAL)
### Proyecto: Workout Cool - Plataforma de Coaching Fitness
### Equipo: Tabanos Team

---

## 1. Datos Generales del Grupo

### 1.1 Integrantes y Autoevaluación

| Nombres y Apellidos | Rol / Responsabilidad en el Hito 3 | Autoevaluación (%) |
| :--- | :--- | :---: |
| **Richard Alberto Condo Zamata** | Diseño y ejecución de pruebas de integración para catálogo, programas, semanas, sesiones y progreso, además de automatización de jobs. | `100%` |
| **Oscar Raul Chilo Huillca** | Pruebas de integración y seguridad para billing guards, control de accesos anónimos y estadísticas Premium (Issue #66). | `100%` |
| **Jeremy Jeison Cruz Gallegos** | Diseño y ejecución de pruebas de extremo a extremo (E2E) con Playwright para flujos de registro, sesiones y finalización de entrenamiento. | `100%` |
| **Pedro Luis Christian Zapana Romero** | Ampliación de la cobertura de pruebas unitarias (Vitest + jsdom), análisis de cobertura (Coverage) y aseguramiento de calidad. | `100%` |
| **Max Edu Ramirez Ccahuana** | Ampliación de la cobertura de pruebas en Bruno (Usuarios + Exercises & Statistics), implementación de workflow en Bruno con Github Actions. | `75%` |

### 1.2 Accesos de Revisión
Se ha otorgado acceso de colaborador y permisos de lectura/revisión en el repositorio al docente:
- **Cuenta del Docente:** [robert-arisaca](https://github.com/robert-arisaca)

---

## 2. Enlaces a los Artefactos del Proyecto

A continuación se detallan las URLs correspondientes a cada uno de los artefactos generados para la revisión del Hito 3:

| Artefacto | URL de Acceso Directo | Descripción Breve |
| :--- | :--- | :--- |
| **Repositorio GitHub** | [GitHub - Tabanos-Team/workout-cool](https://github.com/Tabanos-Team/workout-cool) | Repositorio principal con el código fuente del proyecto, configuración de pruebas en Vitest/Playwright y workflows. |
| **Entorno QA Vercel** | [Workout Cool - QA Vercel](https://workout-cool-ten.vercel.app/) | Entorno de control de calidad desplegado y conectado a base de datos PostgreSQL en la nube (Neon). |
| **GitHub Wiki** | [Wiki de Pruebas - Workout Cool](https://github.com/Tabanos-Team/workout-cool/wiki) | Documentación completa de los planes de pruebas de integración, cobertura de endpoints y especificaciones. |
| **GitHub Pages** | [Reportes de Cobertura](https://tabanos-team.github.io/workout-cool/) | Sitio estático que aloja los reportes interactivos de cobertura de código generados por Vitest. |
| **GitHub Actions** | [Workflow de CI/CD - Workout Cool](https://github.com/Tabanos-Team/workout-cool/actions) | Pipelines automatizados en GitHub Actions para validar lint, unit, integración, E2E y build. |

---

## 3. Descripción Detallada de los Artefactos Generados

### 3.1 Pruebas Unitarias y de Cobertura (Vitest + V8)
Se expandió la suite de pruebas unitarias a un total de **509 casos probados** sobre 76 archivos, utilizando **Vitest**, **React Testing Library** y **jsdom**:
- **Mapeo:** Se validaron componentes reusables de interfaz, lógica de negocio aislada, esquemas de validación con Zod y componentes Premium.
- **Cobertura de Código:** Medida con el motor V8, se superó con creces el umbral mínimo exigido del 85%, alcanzando un **94.28% en statements**, **85.98% en branches**, **91.69% en functions** y **94.87% en lines**.

### 3.2 Pruebas de Integración y Sistema (APIs y Persistencia)
Se diseñaron **26 casos de prueba de integración** y **8 casos de sistema/seguridad** que validan la correcta comunicación entre componentes físicos:
- **Flujo verificado:** Cliente HTTP → API Route → Middleware (Autenticación) → Zod (Validación de entrada) → Prisma ORM → Base de Datos PostgreSQL.
- **Pruebas de Seguridad (Bruno):** Se automatizaron pruebas de endpoints usando Bruno CLI en el entorno QA, garantizando el bloqueo de accesos no autorizados y respuestas limpias de tipo `401 Unauthorized`.

### 3.3 Pruebas E2E (Playwright)
Se configuraron **28 casos de prueba automatizados** con Playwright para simular el comportamiento real de navegación de los usuarios:
- **Navegadores:** Ejecución de pruebas en navegador Chromium de escritorio.
- **Flujos completos:** Smoke tests públicos y escenarios autenticados que comprueban el registro de cuentas, la persistencia de sesión con `storageState` y la finalización completa de rutinas de ejercicio.

### 3.4 GitHub Actions y CD Vercel (Integración y Despliegue Continuo)
Se automatizó todo el ciclo de validación de calidad en el archivo `.github/workflows/ci.yml` ejecutado en cada Pull Request y Push a `main`:
- **Job `quality`:** Instala el entorno con pnpm, ejecuta ESLint y corre las pruebas unitarias y de cobertura.
- **Job `integration`:** Levanta una base de datos PostgreSQL efímera, aplica las migraciones de Prisma y ejecuta las pruebas de integración.
- **Job `e2e`:** Levanta la base de datos y ejecuta la suite completa de Playwright en navegadores.
- **Job `build`:** Valida la compilación limpia del proyecto Next.js.
- **CD Vercel:** Despliegue automático de la rama principal al entorno web QA compartido.
