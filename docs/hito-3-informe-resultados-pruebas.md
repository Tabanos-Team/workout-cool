# HITO 3 - Informe de Resultados de Pruebas

## 1. Resumen ejecutivo

Este informe consolida el estado de pruebas del proyecto Workout Cool para el HITO 3. El proyecto cuenta con pruebas unitarias automatizadas mediante Vitest, coverage V8 configurado y una suite de integración real ampliada para Auth/User, Workout Sessions, Exercises, Programs y Premium Status.

El alcance actual permite afirmar que existe una base de calidad automatizada, especialmente en componentes UI, utilidades, schemas de autenticación, flujo integrado de sesiones de entrenamiento, perfil/preferencias, catálogo de ejercicios, programas e inscripción, estado premium básico, webhooks públicos y smoke tests E2E con Playwright. Para cerrar completamente HITO 3 se recomienda completar ejecución documentada de Postman, ampliar E2E hacia flujos autenticados y extender pruebas controladas hacia checkout sandbox.

## 2. Ambiente usado

| Elemento | Valor |
|----------|-------|
| Proyecto | Workout Cool |
| Framework | Next.js App Router |
| Lenguaje | TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL/Neon |
| Runner unitario | Vitest |
| Coverage | V8 |
| Runner integración | Vitest con ambiente `node` |
| Cliente integración | `fetch` contra servidor local Next |
| CI | GitHub Actions |
| CD | Vercel |
| URL QA | `https://workout-cool-ten.vercel.app/` |

## 3. Datos generales de ejecución

| Campo | Valor |
|-------|-------|
| Fecha de ejecución | 2026-07-06 |
| Rama | Completar con rama usada |
| Commit | Completar con hash de commit |
| Responsable QA | Completar |
| Responsable backend | Completar |
| Responsable frontend | Completar |
| Base de datos usada | Neon/PostgreSQL QA |
| Navegador QA | Completar, por ejemplo Chrome |
| Sistema operativo | Completar |

## 4. Módulos probados y estado

| Módulo | Unitarias | Integración | Sistema/Postman | E2E | Estado general |
|--------|-----------|-------------|-----------------|-----|----------------|
| Auth | Parcial | Implementado vía creación de usuario en suites | Pendiente | Pendiente autenticado | Aprobado parcialmente |
| User profile/preferences | Parcial | Implementado | Pendiente | Pendiente | Aprobado parcialmente |
| Workout sessions | Parcial | Implementado | Pendiente documentar Postman | Pendiente | Aprobado parcialmente |
| Exercises | Parcial | Implementado | Pendiente | Pendiente | Aprobado parcialmente |
| Programs | Parcial | Implementado | Pendiente | Pendiente | Aprobado parcialmente |
| Premium/billing | Parcial UI | Implementado para status/plans y rechazo controlado de checkout sin auth | Pendiente | Smoke público de plans | En progreso |
| Webhooks Stripe/RevenueCat | No aplica unitario directo | Health check RevenueCat implementado | Pendiente controlado | Smoke público RevenueCat | En progreso |
| Statistics | Parcial | Pendiente ampliar | Pendiente | Pendiente | En progreso |
| Admin | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Tools públicos | Pendiente | No aplica API principal | Pendiente | Smoke E2E implementado | Aprobado parcialmente |

## 5. Resultados de pruebas unitarias

### 5.1 Pruebas detectadas

Se detectaron pruebas unitarias y de componentes en:

| Ubicación | Tipo |
|-----------|------|
| `src/components/ui/*.test.tsx` | Componentes UI |
| `src/components/seo/__tests__/*.test.tsx` | Componentes SEO |
| `src/shared/lib/*.test.ts` | Utilidades compartidas |
| `src/features/auth/signup/schema/signup.schema.test.ts` | Schema de registro |
| `src/features/auth/signin/schema/signin.schema.test.ts` | Schema de login |
| `src/features/premium/ui/__tests__/*.test.ts` | UI premium |
| `src/features/pwa-404/__tests__/*.test.ts` | PWA/404 |
| `src/entities/__tests__/entities-user-exercise.test.ts` | Entidades |

### 5.2 Resultado registrado

| Comando | Resultado | Estado |
|---------|-----------|--------|
| `pnpm test` | `76 passed`, `509 tests passed` | Aprobado |

Evidencia a adjuntar:

- Captura de terminal.
- Log de GitHub Actions.
- Link al job de CI.

## 6. Resultados de coverage

Configuración actual:

| Elemento | Valor |
|----------|-------|
| Provider | V8 |
| Reportes | `text`, `html`, `json` |
| Directorio | `coverage` |
| Lines threshold | 70 |
| Functions threshold | 70 |
| Branches threshold | 60 |
| Statements threshold | 70 |

Resultado:

| Comando | Resultado | Estado |
|---------|-----------|--------|
| `pnpm test:coverage` | Completar con porcentajes generados | Pendiente de registrar en informe final |

Evidencia a adjuntar:

- Captura de consola.
- Captura de `coverage/index.html`.
- Artifact de GitHub Actions si se publica.

## 7. Resultados de pruebas de integración

### 7.1 Suite existente

| Campo | Valor |
|-------|-------|
| Archivos | `src/test/integration/*.integration.test.ts` |
| Configuración | `vitest.integration.config.ts` |
| Script | `pnpm test:integration` |
| Servidor local | `http://127.0.0.1:3101` |
| Módulos | Auth/User, Workout Sessions, Exercises, Programs, Premium/Billing y RevenueCat health |

### 7.2 Resultado registrado

| Comando | Resultado | Estado |
|---------|-----------|--------|
| `pnpm test:integration` | `5 passed`, `24 tests passed` | Aprobado |

Salida representativa de endpoints ejercitados por la suite:

```txt
GET /api/programs 200
POST /api/auth/sign-up/email 200
POST /api/workout-sessions/sync 200
GET /api/workout-sessions/user/:userId 200
POST /api/workout-sessions/:sessionId/rating 200
GET /api/workout-sessions/:sessionId/summary 200
POST /api/workout-sessions/:sessionId/rating 400
POST /api/workout-sessions/sync 400
POST /api/auth/signup 200
POST /api/auth/signup 409
POST /api/auth/signup 400
GET /api/billing/status 401
POST /api/premium/checkout 500
GET /api/webhooks/revenuecat 200

Test Files  5 passed (5)
Tests       24 passed (24)
```

### 7.3 Casos de integración ejecutados

| ID | Módulo | Tipo de prueba | Herramienta | Entrada | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|----|--------|----------------|-------------|---------|--------------------|--------------------|--------|-----------|
| INT-WKT-01 | Workout sessions | Integración | Vitest + fetch | Sesión válida con usuario y ejercicio | HTTP 200 y sesión persistida | HTTP 200, sesión consultable por GET | Aprobado | Log terminal |
| INT-WKT-02 | Workout sessions | Integración | Vitest + fetch | `rating: 5` | Rating persistido y visible en summary | Rating y comentario visibles en summary | Aprobado | Log terminal |
| INT-WKT-03 | Workout sessions | Negativo sintáctico | Vitest + fetch | `rating: 9` | HTTP 400 con `INVALID_INPUT` | HTTP 400 | Aprobado | Log terminal |
| INT-WKT-04 | Workout sessions | Negativo semántico | Vitest + fetch | `exerciseId` inexistente | HTTP 400 con `Exercises not found` | HTTP 400 | Aprobado | Log terminal |
| INT-WKT-05 | Workout sessions | Resiliencia | Vitest + fetch | Delay 250 ms y timeout 25 ms | Request abortado | Error esperado capturado | Aprobado | Log terminal |
| INT-USER-01 | User profile | Integración | Vitest + fetch | Cookie válida | Perfil autenticado | HTTP 200 con usuario | Aprobado | Log terminal |
| INT-USER-02 | User profile | Negativo | Vitest + fetch | Sin cookie | HTTP 401 | HTTP 401 | Aprobado | Log terminal |
| INT-USER-03 | User profile | Negativo sintáctico | Vitest + fetch | Imagen inválida | HTTP 400 | HTTP 400 | Aprobado | Log terminal |
| INT-PREF-01 | User preferences | Integración | Vitest + fetch | Preferencias válidas | PUT 200 y GET persistido | HTTP 200 y datos guardados | Aprobado | Log terminal |
| INT-PREF-02 | User preferences | Negativo | Vitest + fetch | `weeklyFrequency: 8` | HTTP 400 | HTTP 400 | Aprobado | Log terminal |
| INT-EXE-01 | Exercises | Integración | Vitest + fetch | Filtro `BODY_ONLY` + `CHEST` | HTTP 200 y ejercicio fixture | HTTP 200 | Aprobado | Log terminal |
| INT-EXE-02 | Exercises | Negativo | Vitest + fetch | `limit=99` | HTTP 400 | HTTP 400 | Aprobado | Log terminal |
| INT-PROG-01 | Programs | Integración | Vitest + fetch | Programa publicado fixture | Lista y detalle HTTP 200 | HTTP 200 | Aprobado | Log terminal |
| INT-PROG-02 | Programs | Integración autenticada | Vitest + fetch | Enroll con cookie | Enrolamiento creado | HTTP 200 | Aprobado | Log terminal |
| INT-PROG-03 | Programs | Negativo | Vitest + fetch | Enroll sin cookie | HTTP 401 | HTTP 401 | Aprobado | Log terminal |
| INT-PREM-01 | Premium status | Integración | Vitest + fetch | Sin cookie | `isPremium: false` | HTTP 200 | Aprobado | Log terminal |
| INT-PREM-02 | Premium status | Integración autenticada | Vitest + fetch | Usuario no premium | `isPremium: false`, count 0 | HTTP 200 | Aprobado | Log terminal |
| INT-AUTH-01 | Auth custom | Integración | Vitest + fetch | Signup válido | HTTP 200 y usuario creado | HTTP 200 | Aprobado | Log terminal |
| INT-AUTH-02 | Auth custom | Negativo semántico | Vitest + fetch | Signup duplicado | Error controlado | HTTP 409 | Aprobado | Log terminal |
| INT-AUTH-03 | Auth custom | Negativo sintáctico | Vitest + fetch | Email inválido/password corto | HTTP 400 | HTTP 400 | Aprobado | Log terminal |
| INT-BILL-01 | Billing | Negativo auth | Vitest + fetch | GET status sin cookie | HTTP 401 | HTTP 401 | Aprobado | Log terminal |
| INT-PREM-03 | Premium checkout | Negativo auth | Vitest + fetch | Checkout sin cookie | Rechazo controlado | HTTP 500 actual, registrado para mejora a 401/403 | Aprobado con observación | Log terminal |
| INT-WH-01 | RevenueCat webhook | Sistema/API health | Vitest + fetch | GET health | HTTP 200 | HTTP 200 | Aprobado | Log terminal |

## 8. Resultados Postman

No se detectó una colección Postman versionada en el repositorio.

| Colección | Estado | Observación |
|-----------|--------|-------------|
| Auth | Pendiente | Crear colección |
| User | Pendiente | Crear colección |
| Workout Sessions | Pendiente | Puede basarse en LAB 08 |
| Exercises | Pendiente | Crear requests de filtros y errores |
| Programs | Pendiente | Crear requests públicos y autenticados |
| Premium | Pendiente | Usar ambiente sandbox |
| Webhooks | Pendiente | Requiere firmas o herramientas externas |

Evidencia requerida para completar:

- Export de colección `.postman_collection.json`.
- Export de environment `.postman_environment.json`.
- Capturas de ejecución.
- Si se usa Newman, log de ejecución.

## 9. Resultados E2E

Se agregó configuración de Playwright para pruebas E2E iniciales de páginas públicas y APIs públicas.

| Herramienta | Estado |
|-------------|--------|
| Playwright | Instalado |
| Cypress | No instalado |
| Scripts `test:e2e` | Existentes |

Resultado registrado:

| Comando | Resultado | Estado |
|---------|-----------|--------|
| `pnpm test:e2e` | `22 passed` en Chromium desktop y mobile | Aprobado |

Casos E2E implementados inicialmente:

| ID | Flujo | Estado |
|----|-------|--------|
| E2E-01 | Render de `/en` | Aprobado |
| E2E-02 | Render de `/en/programs` | Aprobado |
| E2E-03 | Render de `/en/premium` | Aprobado |
| E2E-04 | Render de `/en/tools` y calculadoras públicas | Aprobado |
| E2E-05 | Redirect `/` hacia ruta localizada | Aprobado |
| E2E-06 | API pública `/api/programs` desde browser context | Aprobado |
| E2E-07 | API pública `/api/premium/plans` desde browser context | Aprobado |
| E2E-08 | Health check `/api/webhooks/revenuecat` desde browser context | Aprobado |

Observación técnica de la ejecución: durante navegación pública, React reportó un mismatch de hidratación en `src/features/layout/Header.tsx` entre el enlace de login y el botón de logout. La suite E2E no falló porque las páginas renderizaron y respondieron correctamente, pero se registra como discrepancia no bloqueante para revisión.

Casos E2E críticos aún pendientes:

| ID | Flujo | Estado |
|----|-------|--------|
| E2E-AUTH-01 | Registro/login y sesión visible | Pendiente |
| E2E-WKT-01 | Crear entrenamiento desde builder | Pendiente |
| E2E-WKT-02 | Finalizar sesión y verla en historial | Pendiente |
| E2E-PROG-01 | Programas: ver detalle e inscribirse | Pendiente |

## 10. Resultados CI/CD

### 10.1 GitHub Actions

Workflow detectado:

```txt
.github/workflows/ci.yml
```

Jobs:

| Job | Pasos principales | Estado |
|-----|-------------------|--------|
| `lint` | install, Prisma generate, lint, test, coverage | Existente |
| `build` | install, Prisma generate, build | Existente |

Pendientes recomendados:

| Mejora | Estado |
|--------|--------|
| Agregar `pnpm test:integration` al CI | Pendiente |
| Publicar coverage como artifact | Pendiente |
| Agregar Postman/Newman | Pendiente |
| Agregar Playwright E2E | Parcialmente implementado |
| Usar secrets QA para DB test | Pendiente |

### 10.2 Vercel

| Elemento | Resultado |
|----------|-----------|
| URL QA | `https://workout-cool-ten.vercel.app/` |
| `GET /` | HTTP 307 hacia `/en` |
| `GET /api/programs` | HTTP 200 |
| Estado | Despliegue accesible |

Evidencia a adjuntar:

- Link del deployment Vercel.
- Captura de estado del deployment.
- Captura de URL funcionando.

## 11. Tabla general de resultados por módulo

| ID | Módulo | Tipo de prueba | Herramienta | Entrada | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|----|--------|----------------|-------------|---------|--------------------|--------------------|--------|-----------|
| RES-UNIT-01 | Shared lib | Unitarias | Vitest | Funciones puras | Tests pasan | 509 tests pasaron en ejecución registrada | Aprobado | Captura terminal |
| RES-UNIT-02 | UI components | Unitarias | Vitest + RTL | Render/props/eventos | Componentes renderizan correctamente | Tests existentes pasan | Aprobado | Captura terminal |
| RES-AUTH-01 | Auth schemas | Unitarias | Vitest | Signup/signin schemas | Validan entradas correctas e inválidas | Tests existentes pasan | Aprobado | Captura terminal |
| RES-WKT-01 | Workout sessions | Integración | Vitest + fetch | POST sync | Sesión persistida | Aprobado | Aprobado | Log LAB 08 |
| RES-WKT-02 | Workout sessions | Integración | Vitest + fetch | Rating y summary | Estado actualizado | Aprobado | Aprobado | Log LAB 08 |
| RES-WKT-03 | Workout sessions | Negativo | Vitest + fetch | Rating inválido | HTTP 400 | HTTP 400 | Aprobado | Log LAB 08 |
| RES-WKT-04 | Workout sessions | Resiliencia | Vitest + fetch | Timeout | Abort controlado | Abort capturado | Aprobado | Log integración |
| RES-USER-01 | User | Integración | Vitest + fetch | Profile/preferences | Datos persistidos y validación 400/401 | Aprobado | Aprobado | Log integración |
| RES-EXE-01 | Exercises | Integración | Vitest + fetch | Filtros y catálogo | 200 en válido, 400 en inválido | Aprobado | Aprobado | Log integración |
| RES-PROG-01 | Programs | Integración | Vitest + fetch | List/detail/enroll | 200 en válido, 401/404 en negativos | Aprobado | Aprobado | Log integración |
| RES-PREM-01 | Premium | Integración | Vitest + fetch | Status/plans | 200 y estructura esperada | Aprobado | Aprobado | Log integración |
| RES-POST-01 | API general | Postman | Postman | Colecciones | Requests documentados | No ejecutado | Pendiente | Pendiente |
| RES-E2E-01 | Páginas públicas | E2E | Playwright | Navegación real | Páginas renderizan sin 5xx | `22 passed` junto con APIs públicas | Aprobado | Reporte Playwright |
| RES-E2E-02 | APIs públicas | E2E | Playwright request | Requests públicos | APIs responden con forma esperada | `22 passed` junto con páginas públicas | Aprobado | Reporte Playwright |
| RES-CI-01 | CI | GitHub Actions | Workflow | Push/PR | Lint, test, coverage, build | Workflow existente | Parcial | Link Actions |
| RES-CD-01 | CD | Vercel | Deployment | Push conectado | App desplegada | URL QA responde | Aprobado | Link Vercel |

## 12. Incidentes encontrados

| ID | Descripción | Severidad | Estado | Acción tomada |
|----|-------------|-----------|--------|---------------|
| INC-01 | La suite de integración inicial requirió adaptar la estrategia porque Next App Router no se prueba igual que Express con Supertest | Media | Resuelto | Se usó Vitest + `fetch` contra servidor local Next |
| INC-02 | El endpoint de sync exponía forma interna de `next-safe-action` | Media | Resuelto | Se normalizó respuesta en `/api/workout-sessions/sync` |
| INC-03 | Error semántico de ejercicio inexistente debía reportarse como HTTP 400 | Media | Resuelto | Se asignó status 400 para `Exercises not found` |
| INC-04 | No existe Postman versionado | Baja | Pendiente | Crear colección y environment |
| INC-05 | E2E no cubría navegación real | Media | Resuelto parcialmente | Se instaló Playwright, se agregaron smoke tests públicos y `pnpm test:e2e` aprobó |
| INC-06 | CI aún no ejecuta integración HITO 3 | Media | Pendiente | Agregar `pnpm test:integration` con DB QA |
| INC-07 | Hydration mismatch en `Header` durante E2E público | Baja | Pendiente | Revisar render inicial de sesión para que SSR y cliente no alternen login/logout |
| INC-08 | Checkout premium sin autenticación responde HTTP 500 | Media | Pendiente | Ajustar endpoint para devolver 401/403 si el usuario no está autenticado |

## 13. Reporte de discrepancias

| ID | Resultado esperado | Resultado real | Severidad | Acción tomada | Estado |
|----|--------------------|----------------|-----------|--------------|--------|
| DISC-01 | Integración debe poder ejecutar flujo real API -> DB | Solo había unitarias inicialmente | Media | Se implementó LAB 08 para workout sessions | Cerrado |
| DISC-02 | Casos semánticos deben devolver error controlado | Sync devolvía respuesta no adecuada para semántico | Media | Se normalizó respuesta y status | Cerrado |
| DISC-03 | HITO 3 requiere E2E | No existía Playwright/Cypress | Media | Se instaló Playwright, se agregaron smoke tests públicos y aprobaron 22 tests | Cerrado para smoke público |
| DISC-04 | HITO 3 requiere Postman | No hay colección versionada | Baja | Se documenta plan de colección | Pendiente |
| DISC-05 | CI/CD debe incluir integración | CI no ejecuta `test:integration` | Media | Se recomienda agregar job/paso | Pendiente |
| DISC-06 | UI pública debe hidratar sin diferencias SSR/cliente | Header alterna login/logout durante hidratación | Baja | Registrar hallazgo para corrección posterior | Pendiente |
| DISC-07 | Checkout sin sesión debería rechazar por autenticación | Endpoint responde 500 controlado | Media | Registrar mejora para convertir a 401/403 | Pendiente |

## 14. Conclusiones

1. El proyecto tiene una base sólida de pruebas unitarias con Vitest y coverage V8.
2. La suite de integración HITO 3 valida Auth/User, Workout Sessions, Exercises, Programs y Premium Status.
3. La API del proyecto está organizada en `app/api` con módulos claros: Auth, User, Workout Sessions, Exercises, Programs, Premium, Webhooks y Statistics.
4. El despliegue QA en Vercel está accesible.
5. GitHub Actions ya ejecuta lint, test, coverage y build, pero falta incluir integración, Postman y E2E.
6. Playwright quedó instalado y ejecutado correctamente para smoke tests públicos, con resultado `22 passed`.
7. Para cerrar HITO 3 con mayor solidez, se recomienda ampliar Playwright a flujos autenticados y versionar colecciones Postman.

## 15. Recomendaciones

| Prioridad | Recomendación | Motivo |
|-----------|---------------|--------|
| Alta | Agregar `pnpm test:integration` a CI | Evita regresiones en API + DB |
| Alta | Crear colección Postman para Auth, User, Workout, Programs y Exercises | Evidencia de sistema y aceptación |
| Alta | Ampliar Playwright para flujos autenticados críticos | Cubre experiencia real de usuario |
| Media | Publicar coverage y reportes como artifacts | Mejora evidencia del HITO |
| Media | Crear DB QA separada con datos controlados | Evita contaminación de datos |
| Media | Usar prefijos de datos `hito3-` en pruebas | Facilita limpieza |
| Baja | Agregar pruebas de tools públicos | Mejora cobertura funcional no autenticada |

## 16. Anexos

### 16.1 Links

| Recurso | URL |
|---------|-----|
| Vercel QA | `https://workout-cool-ten.vercel.app/` |
| GitHub Actions | Completar con link del workflow |
| GitHub Wiki | Completar con link de página publicada |
| Postman Collection | Pendiente |
| Coverage HTML | `coverage/index.html` local o artifact CI |
| Playwright Report | `playwright-report/index.html` local o artifact CI |

### 16.2 Capturas pendientes

| Evidencia | Estado |
|-----------|--------|
| `pnpm test` | Pendiente adjuntar captura |
| `pnpm test:coverage` | Pendiente adjuntar captura |
| `pnpm test:integration` | Pendiente adjuntar captura |
| Vercel deployment | Pendiente adjuntar captura |
| GitHub Actions exitoso | Pendiente adjuntar captura |
| Postman | Pendiente |
| E2E | Aprobado, adjuntar captura/reporte `22 passed` |

### 16.3 Archivos relacionados

| Archivo | Uso |
|---------|-----|
| `docs/hito-3-plan-pruebas-sistema-integracion-e2e.md` | Plan HITO 3 |
| `docs/hito-3-informe-resultados-pruebas.md` | Este informe |
| `docs/lab-08-integration-tests.md` | Informe LAB 08 integración |
| `docs/unit-test-plan.md` | Plan de unitarias |
| `docs/integration-flow-auth-db-premium.md` | Flujos Auth DB Premium |
| `docs/functional-test-training.md` | Casos funcionales de entrenamiento |
| `.github/workflows/ci.yml` | CI actual |
| `vitest.config.ts` | Configuración unitarias |
| `vitest.integration.config.ts` | Configuración integración |
| `src/test/integration/*.integration.test.ts` | Suites integración HITO 3 |
| `playwright.config.ts` | Configuración E2E Playwright |
| `e2e/*.spec.ts` | Smoke tests E2E |

## 17. Estado final del informe

| Área | Estado |
|------|--------|
| Unitarias | Aprobado con evidencia registrada |
| Coverage | Configurado, pendiente adjuntar porcentajes finales |
| Integración | Aprobado para Auth/User, Workout Sessions, Exercises, Programs y Premium Status |
| Postman | Pendiente de crear/ejecutar colección |
| E2E | Aprobado para smoke público con `22 passed`; pendiente ampliar flujos autenticados |
| CI | Parcial, falta integración/E2E/Postman |
| CD | Despliegue Vercel accesible |
| Aceptación QA | Pendiente de firma/capturas |

Este informe queda listo para completarse con capturas y enlaces finales antes de publicarlo en GitHub Wiki.
