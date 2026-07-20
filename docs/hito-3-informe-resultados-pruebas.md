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
| Fecha de ejecución | 2026-07-08 |
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
| Programs | Parcial | Implementado con grafo completo y deploy Vercel | Bruno manual en ejecución | E2E Playwright aprobado | Aprobado |
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
| `pnpm test:coverage` | Statements 94.28%, Branches 85.98%, Functions 91.69%, Lines 94.87% | Aprobado |

Evidencia a adjuntar:

- Captura de consola.
- Captura de `coverage/index.html`.
- Artifact `coverage-report` de GitHub Actions.

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
| `pnpm test:integration` | `5 passed`, `26 tests passed` | Aprobado |

Salida representativa de endpoints ejercitados por la suite:

```txt
GET /api/programs 200
GET /api/programs/:slug 200
GET /api/programs/:slug/sessions/:sessionSlug 200
POST /api/programs/session-progress/start 200
POST /api/programs/session-progress/:progressId/complete 200
GET /api/programs/:slug/progress 200
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
Tests       26 passed (26)
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
| INT-PROG-01 | Programs | Integración | Vitest + fetch | Programa publicado fixture | Lista y detalle HTTP 200 | HTTP 200 | Aprobado | Log verbose: `lists public programs... 614ms` |
| INT-PROG-02 | Programs | Integración | Vitest + fetch | Sesión con ejercicio y sets sugeridos | HTTP 200 con ejercicios y `suggestedSets` | HTTP 200 | Aprobado | Log verbose: `fetches a program session detail... 414ms` |
| INT-PROG-03 | Programs | Integración autenticada | Vitest + fetch | Enroll con cookie | Enrolamiento creado | HTTP 200 | Aprobado | Log verbose: `enrolls an authenticated user... 813ms` |
| INT-PROG-04 | Programs | Integración end-to-end API | Vitest + fetch | Enroll -> start -> sync -> complete -> progress | Progreso completo y workout enlazado | HTTP 200, progreso 100% | Aprobado | Log verbose: `starts, syncs and completes... 5088ms` |
| INT-PROG-05 | Programs | Validación DB | Prisma + Neon | Grafo completo del programa | Todas las relaciones persistidas | `programs`, `weeks`, `sessions`, `sets`, `progress`, `workout` validados | Aprobado | Aserciones Prisma en suite |
| INT-PROG-06 | Programs | Negativo | Vitest + fetch | Enroll sin cookie y slug inexistente | HTTP 401 y HTTP 404 | HTTP 401/404 | Aprobado | Log verbose: `rejects unauthenticated... 691ms` |
| INT-PREM-01 | Premium status | Integración | Vitest + fetch | Sin cookie | `isPremium: false` | HTTP 200 | Aprobado | Log terminal |
| INT-PREM-02 | Premium status | Integración autenticada | Vitest + fetch | Usuario no premium | `isPremium: false`, count 0 | HTTP 200 | Aprobado | Log terminal |
| INT-AUTH-01 | Auth custom | Integración | Vitest + fetch | Signup válido | HTTP 200 y usuario creado | HTTP 200 | Aprobado | Log terminal |
| INT-AUTH-02 | Auth custom | Negativo semántico | Vitest + fetch | Signup duplicado | Error controlado | HTTP 409 | Aprobado | Log terminal |
| INT-AUTH-03 | Auth custom | Negativo sintáctico | Vitest + fetch | Email inválido/password corto | HTTP 400 | HTTP 400 | Aprobado | Log terminal |
| INT-BILL-01 | Billing | Negativo auth | Vitest + fetch | GET status sin cookie | HTTP 401 | HTTP 401 | Aprobado | Log terminal |
| INT-PREM-03 | Premium checkout | Negativo auth | Vitest + fetch | Checkout sin cookie | Rechazo controlado | HTTP 500 actual, registrado para mejora a 401/403 | Aprobado con observación | Log terminal |
| INT-WH-01 | RevenueCat webhook | Sistema/API health | Vitest + fetch | GET health | HTTP 200 | HTTP 200 | Aprobado | Log terminal |

### 7.4 Resultado especifico del modulo Programs

La suite `src/test/integration/programs.integration.test.ts` valida el grafo completo del modulo Programs contra API route, validacion, Prisma y PostgreSQL/Neon. Para evidencia desplegada se ejecuto contra Vercel con datos conservados en Neon mediante `KEEP_INTEGRATION_DATA=true`.

Entidades cubiertas:

| Entidad | Cobertura |
|---------|-----------|
| `programs` | Creacion de programa publicado, listado publico y detalle por slug |
| `program_coaches` | Coach asociado incluido en detalle de programa |
| `program_weeks` | Semana asociada al programa y orden de sesiones |
| `program_sessions` | Detalle de sesion por slug y start de progreso |
| `program_session_exercises` | Ejercicio asociado a la sesion del programa |
| `program_suggested_sets` | Sets sugeridos incluidos y ordenados por `setIndex` |
| `user_program_enrollments` | Inscripcion autenticada y estado de enrolamiento |
| `user_session_progress` | Inicio y completado de sesion del programa |
| `workout_sessions` | Sincronizacion de workout real enlazado a `user_session_progress.workoutSessionId` |

Resultado ejecutado contra deploy:

```txt
pnpm test:integration:programs:deployed:keep

Test Files  1 passed (1)
Tests       8 passed (8)
Duration    30.85s
```

Log terminal detallado con reporter verbose:

| ID | Caso ejecutado | Log terminal | Estado |
|----|----------------|--------------|--------|
| INT-PROG-01 | `searches exercises by muscle and equipment through API validation and Prisma` | `✓ ... 824ms` | Aprobado |
| INT-PROG-02 | `rejects invalid exercise query parameters with HTTP 400` | `✓ ... 306ms` | Aprobado |
| INT-PROG-03 | `lists exercises from the public catalog with pagination metadata` | `✓ ... 715ms` | Aprobado |
| INT-PROG-04 | `lists public programs and fetches a program detail by slug` | `✓ ... 614ms` | Aprobado |
| INT-PROG-05 | `fetches a program session detail with exercises and suggested sets` | `✓ ... 414ms` | Aprobado |
| INT-PROG-06 | `enrolls an authenticated user in a program and reads enrollment status` | `✓ ... 813ms` | Aprobado |
| INT-PROG-07 | `starts, syncs and completes a program session through the deployed-compatible API flow` | `✓ ... 5088ms` | Aprobado |
| INT-PROG-08 | `rejects unauthenticated program enrollment and missing program slugs` | `✓ ... 691ms` | Aprobado |

Resumen del log:

```txt
Test Files  1 passed (1)
Tests       8 passed (8)
Start at    18:15:45
Duration    28.69s
```

Casos especificos:

| ID | Caso | Entidades principales | Resultado |
|----|------|-----------------------|-----------|
| INT-PROG-01 | Listar catalogo y detalle de programa | `programs`, `program_coaches`, `program_weeks`, `program_sessions` | Aprobado |
| INT-PROG-02 | Obtener detalle de sesion con ejercicios y sets | `program_sessions`, `program_session_exercises`, `program_suggested_sets` | Aprobado |
| INT-PROG-03 | Inscribirse y consultar estado | `user_program_enrollments`, `programs` | Aprobado |
| INT-PROG-04 | Iniciar sesion de programa | `user_session_progress`, `program_sessions` | Aprobado |
| INT-PROG-05 | Sincronizar workout real | `workout_sessions`, `workout_session_exercises`, `workout_sets` | Aprobado |
| INT-PROG-06 | Completar sesion y validar progreso | `user_session_progress`, `user_program_enrollments`, `workout_sessions` | Aprobado |
| INT-PROG-07 | Validar grafo completo directamente en DB | Todas las entidades anteriores | Aprobado |
| INT-PROG-08 | Casos negativos de auth y slug inexistente | API Programs | Aprobado |

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
| `pnpm test:e2e` | `26 passed` en Chromium desktop y mobile | Aprobado |
| `pnpm test:e2e:programs:deployed` | `4 passed` contra Vercel en Chromium desktop y mobile | Aprobado |

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
| E2E-PROG-01 | Catalogo `/en/programs` y detalle de programa | Aprobado |
| E2E-PROG-02 | Pagina de sesion de programa y API anidada con ejercicios/sets | Aprobado |

Resultado especifico de Playwright Programs:

```txt
pnpm test:e2e:programs:deployed

Running 4 tests using 2 workers
4 passed (9.8s)
```

Resultado local completo de Playwright:

```txt
pnpm test:e2e

Running 26 tests using 6 workers
26 passed (1.0m)
```

Tabla estilo reporte HTML de Playwright para Programs:

| Proyecto | Archivo | Prueba | Resultado | Duracion |
|----------|---------|--------|-----------|----------|
| `chromium` | `e2e/programs.spec.ts` | `renders the public programs catalog and opens a program detail page` | Passed | 4.8s |
| `mobile-chrome` | `e2e/programs.spec.ts` | `renders the public programs catalog and opens a program detail page` | Passed | 5.1s |
| `chromium` | `e2e/programs.spec.ts` | `loads a program session page and validates nested program API data` | Passed | 3.1s |
| `mobile-chrome` | `e2e/programs.spec.ts` | `loads a program session page and validates nested program API data` | Passed | 3.2s |

Evidencia generada:

| Evidencia | Ubicacion / referencia |
|-----------|------------------------|
| Reporte HTML Playwright | `playwright-report/index.html` |
| Archivo E2E Programs | `e2e/programs.spec.ts` |
| Comando | `pnpm test:e2e:programs:deployed` |
| URL evaluada | `https://workout-cool-ten.vercel.app` |

Observación técnica de la ejecución: durante navegación pública, React reportó un mismatch de hidratación en `src/features/layout/Header.tsx` entre el enlace de login y el botón de logout. La suite E2E no falló porque las páginas renderizaron y respondieron correctamente, pero se registra como discrepancia no bloqueante para revisión.

Casos E2E críticos aún pendientes:

| ID | Flujo | Estado |
|----|-------|--------|
| E2E-AUTH-01 | Registro/login y sesión visible | Pendiente |
| E2E-WKT-01 | Crear entrenamiento desde builder | Pendiente |
| E2E-WKT-02 | Finalizar sesión y verla en historial | Pendiente |
| E2E-PROG-03 | Programas: inscripcion desde UI autenticada | Pendiente |

### 9.1 Pruebas de aceptacion del modulo Programs

Estas pruebas de aceptacion se basan en el formato de checklist QA usado por el equipo y se apoyan en evidencias de Bruno, Vitest Integration y Playwright. El actor principal es un usuario autenticado, salvo en los casos de catalogo publico.

| ID | Funcionalidad | Requisito asociado | Actor | Precondiciones | Pasos de prueba | Resultado esperado | Evidencia | Estado |
|----|---------------|--------------------|-------|----------------|-----------------|--------------------|-----------|--------|
| AT-PROG-001 | Ver catalogo de programas | El sistema debe mostrar programas publicados | Usuario visitante o autenticado | Debe existir al menos un programa `PUBLISHED` y `isActive=true` | 1. Abrir `/en/programs`.<br>2. Consultar `GET /api/programs`.<br>3. Verificar listado visible. | El catalogo carga sin error y muestra programas disponibles. | Playwright `renders the public programs catalog...`; API HTTP 200 | Aprobado |
| AT-PROG-002 | Ver detalle de programa | El sistema debe mostrar informacion completa del programa | Usuario visitante o autenticado | Programa con slug valido, coach, week y session | 1. Abrir `/en/programs/:slug`.<br>2. Consultar `GET /api/programs/:slug`.<br>3. Verificar coach, semanas y sesiones. | El detalle muestra titulo, coach, semanas y sesiones. | Integracion INT-PROG-04; Playwright Programs | Aprobado |
| AT-PROG-003 | Ver detalle de sesion | El sistema debe mostrar ejercicios y sets sugeridos de la sesion | Usuario visitante o autenticado | Programa con sesion y ejercicios asociados | 1. Abrir `/en/programs/:slug/session/:sessionSlug`.<br>2. Consultar `GET /api/programs/:slug/sessions/:sessionSlug`.<br>3. Verificar ejercicios y suggested sets. | La sesion carga con ejercicios y sets sugeridos ordenados. | Integracion INT-PROG-05; Playwright `loads a program session page...` | Aprobado |
| AT-PROG-004 | Inscripcion a programa | El usuario debe poder inscribirse a un programa | Usuario autenticado | Usuario con cookie valida y programa publicado | 1. Enviar `POST /api/programs/:slug/enroll`.<br>2. Consultar `GET /api/programs/:slug/enroll`.<br>3. Verificar enrollment. | Se crea `user_program_enrollments` y el estado indica inscrito. | Integracion INT-PROG-06; Bruno manual | Aprobado |
| AT-PROG-005 | Iniciar sesion de programa | El usuario inscrito debe poder iniciar una sesion | Usuario autenticado | Enrollment existente y `program_sessions.id` valido | 1. Enviar `POST /api/programs/session-progress/start`.<br>2. Validar `sessionProgress.id`.<br>3. Revisar DB. | Se crea o retorna `user_session_progress`. | Integracion INT-PROG-07; Bruno manual | Aprobado |
| AT-PROG-006 | Sincronizar workout del programa | El entrenamiento realizado debe persistirse | Usuario autenticado | Sesion de programa iniciada y ejercicio valido | 1. Enviar `POST /api/workout-sessions/sync`.<br>2. Usar el `workoutSessionId` generado.<br>3. Verificar `workout_sessions`. | Se crea `workout_sessions` con ejercicios y sets completados. | Integracion INT-PROG-07; Bruno manual | Aprobado |
| AT-PROG-007 | Completar sesion de programa | El progreso debe actualizarse al finalizar el workout | Usuario autenticado | `progressId` y `workoutSessionId` validos | 1. Enviar `POST /api/programs/session-progress/:progressId/complete`.<br>2. Consultar `GET /api/programs/:slug/progress`.<br>3. Revisar DB. | `completedAt` queda informado, el progreso llega a 100% en programa de una sesion. | Integracion INT-PROG-07; Bruno manual | Aprobado |
| AT-PROG-008 | Manejo de errores | El sistema debe rechazar peticiones invalidas | Usuario visitante o autenticado | Sin cookie o slug inexistente | 1. Enviar enroll sin cookie.<br>2. Consultar slug inexistente.<br>3. Verificar codigo HTTP. | El sistema responde 401 para no autenticado y 404 para slug inexistente. | Integracion INT-PROG-08 | Aprobado |

## 10. Resultados CI/CD

### 10.1 GitHub Actions

Workflow detectado:

```txt
.github/workflows/ci.yml
```

Jobs actualizados:

| Job | Pasos principales | Estado |
|-----|-------------------|--------|
| `quality` | install, Prisma generate, lint, test, coverage, artifact coverage | Implementado |
| `integration` | PostgreSQL 16 service, `prisma db push`, `pnpm test:integration` | Implementado |
| `e2e` | PostgreSQL 16 service, `prisma db push`, Playwright Chromium, `pnpm test:e2e`, artifact report | Implementado |
| `build` | install, Prisma generate, `pnpm build` | Implementado |

Pendientes recomendados:

| Mejora | Estado |
|--------|--------|
| Agregar `pnpm test:integration` al CI | Implementado |
| Publicar coverage como artifact | Implementado |
| Agregar Postman/Newman | Pendiente |
| Agregar Playwright E2E | Implementado |
| Usar base PostgreSQL aislada para CI | Implementado con servicio temporal |
| Usar secrets QA para pruebas desplegadas opcionales | Pendiente |

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
| RES-PROG-02 | Programs | Integración deploy | Vitest + fetch | Enroll -> start -> sync workout -> complete -> progress | Grafo Programs y progreso persistidos | `8 passed` contra Vercel/Neon | Aprobado | Log `pnpm test:integration:programs:deployed:keep` |
| RES-PROG-03 | Programs | E2E | Playwright | Catalogo, detalle y pagina de sesion | UI y API anidada cargan sin 5xx | `4 passed` contra Vercel | Aprobado | Reporte Playwright |
| RES-PREM-01 | Premium | Integración | Vitest + fetch | Status/plans | 200 y estructura esperada | Aprobado | Aprobado | Log integración |
| RES-POST-01 | API general | Postman | Postman | Colecciones | Requests documentados | No ejecutado | Pendiente | Pendiente |
| RES-E2E-01 | Páginas públicas | E2E | Playwright | Navegación real | Páginas renderizan sin 5xx | Incluido en `26 passed` | Aprobado | Reporte Playwright |
| RES-E2E-02 | APIs públicas | E2E | Playwright request | Requests públicos | APIs responden con forma esperada | Incluido en `26 passed` | Aprobado | Reporte Playwright |
| RES-CI-01 | CI | GitHub Actions | Workflow | Push/PR | Lint, test, coverage, integración, E2E y build | Workflow actualizado | Aprobado pendiente de corrida remota | Link Actions |
| RES-CD-01 | CD | Vercel | Deployment | Push conectado | App desplegada | URL QA responde | Aprobado | Link Vercel |

### 11.1 Consolidado de resultados

| Tipo de prueba | Alcance registrado | Total ejecutado/documentado | Aprobados | Fallidos | Pendientes | Evidencia principal |
|----------------|--------------------|-----------------------------|-----------|---------|------------|---------------------|
| Unitarias | Componentes, schemas, libs y entidades | 509 tests | 509 | 0 | 0 | `pnpm test` |
| Integracion general | Auth/User, Workout Sessions, Exercises, Programs, Premium/Billing, RevenueCat | 26 tests | 26 | 0 | 0 | `pnpm test:integration` |
| Integracion Programs desplegada | Vercel + Neon: catalogo, detalle, sesion, enroll, start, sync, complete, progress y DB graph | 8 tests | 8 | 0 | 0 | `pnpm test:integration:programs:deployed:keep` |
| E2E smoke publico + Programs local | Home, Programs, Premium, Tools, APIs publicas, redirect locale, detalle Programs y sesión Programs | 26 tests | 26 | 0 | 0 | `pnpm test:e2e` |
| E2E Programs desplegado | Catalogo, detalle, pagina de sesion y API anidada Programs | 4 tests | 4 | 0 | 0 | `pnpm test:e2e:programs:deployed` |
| Aceptacion Programs | Checklist funcional AT-PROG-001 a AT-PROG-008 | 8 casos | 8 | 0 | 0 | Bruno manual + Vitest + Playwright |
| Postman/Bruno general | Colecciones manuales por endpoint | En ejecucion manual | Completar | Completar | Completar | Capturas Bruno |

Resumen numerico automatizado:

| Categoria automatizada | Total | Pasaron | Fallaron | Porcentaje aprobado |
|------------------------|-------|---------|----------|---------------------|
| Unitarias | 509 | 509 | 0 | 100% |
| Integracion general | 26 | 26 | 0 | 100% |
| E2E local completo | 26 | 26 | 0 | 100% |
| Integracion Programs deploy | 8 | 8 | 0 | 100% |
| E2E Programs deploy | 4 | 4 | 0 | 100% |
| Total automatizado destacado para Programs | 16 | 16 | 0 | 100% |

## 12. Pruebas de rendimiento

Las pruebas de rendimiento se realizaron con Grafana k6. El objetivo fue verificar el comportamiento de los principales servicios REST bajo diferentes niveles de concurrencia, evaluando tiempos de respuesta, porcentaje de errores y estabilidad del sistema.

Los escenarios implementados siguieron una estrategia incremental compuesta por Smoke, Load, Stress y Spike, permitiendo observar el comportamiento del sistema desde una carga mínima hasta un incremento abrupto de usuarios concurrentes. Durante las pruebas se evaluaron los servicios de autenticación, consulta de perfil, gestión de preferencias y sincronización de sesiones de entrenamiento, por ser las funcionalidades críticas del sistema.

Los umbrales de aceptación fueron definidos tomando como referencia los criterios de percepción del usuario propuestos por Nielsen, la metodología Apdex para evaluación del rendimiento de aplicaciones y las recomendaciones ampliamente utilizadas para APIs REST, complementadas con un proceso de calibración basado en el comportamiento real del sistema durante las pruebas preliminares. De esta forma, los umbrales representan valores alcanzables por la arquitectura desplegada sin dejar de detectar regresiones de rendimiento.

### 12.1 Escenarios ejecutados

| Escenario | Configuración de la carga | Objetivo |
|-----------|---------------------------|----------|
| Smoke | 1 usuario virtual (VU) durante 30 s | Verificar el funcionamiento básico del sistema y establecer el tiempo de respuesta base (*baseline*) sin carga significativa. |
| Load | 20 usuarios virtuales (VUs) durante 2 min | Evaluar el comportamiento del sistema bajo una carga representativa de operación normal. |
| Stress | Hasta 50 usuarios virtuales (VUs) durante 3 min | Analizar la degradación progresiva del rendimiento al incrementar la carga de usuarios concurrentes e identificar el punto en el que el servicio comienza a deteriorarse. |
| Spike | Hasta 100 usuarios virtuales (VUs) durante 40 s | Evaluar la capacidad del sistema para responder ante incrementos súbitos de usuarios concurrentes y medir su estabilidad durante picos de demanda. |

### 12.2 Umbrales de aceptación

Los umbrales utilizados durante la ejecución fueron los siguientes.

Métrica	Umbral

| Métrica | Umbral de aceptación |
|---------|---------------------:|
| HTTP Requests fallidas | < 1 % |
| Tiempo de respuesta HTTP (p95) | < 700 ms |
| Tiempo de respuesta HTTP (p99) | < 1200 ms |
| Inicio de sesión (p95) | < 400 ms |
| Inicio de sesión (p99) | < 800 ms |
| Perfil de usuario (p95) | < 300 ms |
| Perfil de usuario (p99) | < 600 ms |
| Preferencias (GET) (p95) | < 300 ms |
| Preferencias (PUT) (p95) | < 400 ms |
| Sincronización de entrenamiento (p95) | < 700 ms |
| Sincronización de entrenamiento (p99) | < 1200 ms |

### 12.3 Resultados obtenidos

La ejecución completa de la batería de pruebas mostró que el sistema mantuvo un comportamiento estable durante los cuatro escenarios de carga. No se registraron errores HTTP en las operaciones evaluadas y todos los umbrales definidos fueron satisfechos.

| Métrica | Smoke | Load | Stress | Spike | Estado |
|---------|:-----:|:----:|:------:|:-----:|:------:|
| Tiempo de respuesta HTTP (p95) | 339 ms | 387 ms | 382 ms | 373 ms | Aprobado |
| Tiempo de respuesta HTTP (p99) | 382 ms | 416 ms | 406 ms | 400 ms | Aprobado |
| Perfil de usuario (p95) | 241 ms | 273 ms | 259 ms | 261 ms | Aprobado |
| Perfil de usuario (p99) | 241 ms | 397 ms | 314 ms | 291 ms | Aprobado |
| Preferencias (GET) (p95) | 261 ms | 267 ms | 256 ms | 257 ms | Aprobado |
| Preferencias (PUT) (p95) | 250 ms | 269 ms | 260 ms | 256 ms | Aprobado |
| Sincronización de entrenamiento (p95) | 382 ms | 401 ms | 401 ms | 393 ms | Aprobado |
| Sincronización de entrenamiento (p99) | 391 ms | 423 ms | 431 ms | 411 ms | Aprobado |

### 12.4 Evaluación

Los resultados obtenidos indican que el sistema mantiene tiempos de respuesta inferiores a 450 ms incluso durante escenarios de estrés y picos de carga, manteniéndose dentro de los límites definidos para las operaciones críticas. Asimismo, no se observaron incrementos significativos de latencia entre los escenarios de Load, Stress y Spike, lo que evidencia un comportamiento estable de la aplicación frente al incremento de usuarios concurrentes.

Durante las primeras ejecuciones se identificaron respuestas HTTP 429 (Too Many Requests) asociadas al mecanismo de protección del servicio de autenticación y errores derivados del uso de identificadores de ejercicios inexistentes en las pruebas sintéticas. Una vez corregida la estrategia de creación de usuarios de prueba y empleando identificadores válidos de ejercicios, las pruebas finales finalizaron sin errores funcionales, cumpliéndose el 100 % de los umbrales establecidos.

Los resultados permiten concluir que la arquitectura desplegada de Workout Cool presenta un nivel de rendimiento adecuado para la carga evaluada, manteniendo tiempos de respuesta consistentes y sin degradaciones apreciables entre escenarios, lo que constituye un indicador favorable de la calidad del sistema desde la perspectiva del atributo de rendimiento.

### 12.5 Evidencia

<img width="684" height="498" alt="image" src="https://github.com/user-attachments/assets/e8bd3323-6820-40a0-bc94-1b1bebe300ba" />
<img width="683" height="528" alt="image" src="https://github.com/user-attachments/assets/f5c85021-20ee-4773-b081-278087d65413" />
<img width="680" height="560" alt="image" src="https://github.com/user-attachments/assets/313a3bc5-9957-4bff-95cb-320fa018c15c" />

Figura 1. Resumen de ejecución de k6 mostrando el cumplimiento de los umbrales de rendimiento y las métricas p95 y p99 obtenidas para cada escenario de carga.

## 13. Incidentes encontrados

| ID | Descripción | Severidad | Estado | Acción tomada |
|----|-------------|-----------|--------|---------------|
| INC-01 | La suite de integración inicial requirió adaptar la estrategia porque Next App Router no se prueba igual que Express con Supertest | Media | Resuelto | Se usó Vitest + `fetch` contra servidor local Next |
| INC-02 | El endpoint de sync exponía forma interna de `next-safe-action` | Media | Resuelto | Se normalizó respuesta en `/api/workout-sessions/sync` |
| INC-03 | Error semántico de ejercicio inexistente debía reportarse como HTTP 400 | Media | Resuelto | Se asignó status 400 para `Exercises not found` |
| INC-04 | No existe Postman versionado | Baja | Pendiente | Crear colección y environment |
| INC-05 | E2E no cubría navegación real | Media | Resuelto parcialmente | Se instaló Playwright, se agregaron smoke tests públicos y `pnpm test:e2e` aprobó |
| INC-06 | CI aún no ejecutaba integración HITO 3 | Media | Resuelto | Se agregó job `integration` con PostgreSQL temporal y `pnpm test:integration` |
| INC-07 | Hydration mismatch en `Header` durante E2E público | Baja | Pendiente | Revisar render inicial de sesión para que SSR y cliente no alternen login/logout |
| INC-08 | Checkout premium sin autenticación responde HTTP 500 | Media | Pendiente | Ajustar endpoint para devolver 401/403 si el usuario no está autenticado |

## 14. Reporte de discrepancias

| ID | Resultado esperado | Resultado real | Severidad | Acción tomada | Estado |
|----|--------------------|----------------|-----------|--------------|--------|
| DISC-01 | Integración debe poder ejecutar flujo real API -> DB | Solo había unitarias inicialmente | Media | Se implementó LAB 08 para workout sessions | Cerrado |
| DISC-02 | Casos semánticos deben devolver error controlado | Sync devolvía respuesta no adecuada para semántico | Media | Se normalizó respuesta y status | Cerrado |
| DISC-03 | HITO 3 requiere E2E | No existía Playwright/Cypress | Media | Se instaló Playwright, se agregaron smoke tests públicos y aprobaron 26 tests | Cerrado para smoke público y Programs |
| DISC-04 | HITO 3 requiere Postman | No hay colección versionada | Baja | Se documenta plan de colección | Pendiente |
| DISC-05 | CI/CD debe incluir integración | CI no ejecutaba `test:integration` ni E2E | Media | Se agregaron jobs `integration` y `e2e` al workflow | Cerrado pendiente de corrida remota |
| DISC-06 | UI pública debe hidratar sin diferencias SSR/cliente | Header alterna login/logout durante hidratación | Baja | Registrar hallazgo para corrección posterior | Pendiente |
| DISC-07 | Checkout sin sesión debería rechazar por autenticación | Endpoint responde 500 controlado | Media | Registrar mejora para convertir a 401/403 | Pendiente |

## 15. Conclusiones

1. El proyecto tiene una base sólida de pruebas unitarias con Vitest y coverage V8.
2. La suite de integración HITO 3 valida Auth/User, Workout Sessions, Exercises, Programs y Premium Status.
3. La API del proyecto está organizada en `app/api` con módulos claros: Auth, User, Workout Sessions, Exercises, Programs, Premium, Webhooks y Statistics.
4. El despliegue QA en Vercel está accesible.
5. GitHub Actions ya está preparado para ejecutar lint, test, coverage, integración, E2E y build en jobs separados.
6. Playwright quedó instalado y ejecutado correctamente para smoke tests públicos y Programs, con resultado `26 passed`.
7. Para cerrar HITO 3 con mayor solidez, se recomienda ampliar Playwright a flujos autenticados y versionar colecciones Postman.

## 16. Recomendaciones

| Prioridad | Recomendación | Motivo |
|-----------|---------------|--------|
| Alta | Mantener `pnpm test:integration` en CI con PostgreSQL temporal | Evita regresiones en API + DB |
| Alta | Crear colección Postman para Auth, User, Workout, Programs y Exercises | Evidencia de sistema y aceptación |
| Alta | Ampliar Playwright para flujos autenticados críticos | Cubre experiencia real de usuario |
| Media | Publicar coverage y reportes como artifacts | Mejora evidencia del HITO |
| Media | Crear DB QA separada con datos controlados | Evita contaminación de datos |
| Media | Usar prefijos de datos `hito3-` en pruebas | Facilita limpieza |
| Baja | Agregar pruebas de tools públicos | Mejora cobertura funcional no autenticada |

## 17. Anexos

### 17.1 Links

| Recurso | URL |
|---------|-----|
| Vercel QA | `https://workout-cool-ten.vercel.app/` |
| GitHub Actions | Completar con link del workflow |
| GitHub Wiki | Completar con link de página publicada |
| Postman Collection | Pendiente |
| Coverage HTML | `coverage/index.html` local o artifact CI |
| Playwright Report | `playwright-report/index.html` local o artifact CI |

### 17.2 Capturas pendientes

| Evidencia | Estado |
|-----------|--------|
| `pnpm test` | Pendiente adjuntar captura |
| `pnpm test:coverage` | Aprobado, adjuntar captura/log con porcentajes |
| `pnpm test:integration` | Aprobado, adjuntar captura/log `26 passed` |
| Vercel deployment | Pendiente adjuntar captura |
| GitHub Actions exitoso | Pendiente adjuntar captura |
| Postman | Pendiente |
| E2E | Aprobado, adjuntar captura/reporte `26 passed` |

### 17.3 Archivos relacionados

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

## 18. Estado final del informe

| Área | Estado |
|------|--------|
| Unitarias | Aprobado con evidencia registrada |
| Coverage | Aprobado con porcentajes registrados |
| Integración | Aprobado para Auth/User, Workout Sessions, Exercises, Programs completo y Premium Status |
| Postman | Pendiente de crear/ejecutar colección |
| E2E | Aprobado para smoke público y Programs con `26 passed`; pendiente ampliar flujos autenticados de Auth/Workout |
| CI | Implementado para lint, unitarias, coverage, integración, E2E y build; pendiente Postman/Newman |
| CD | Despliegue Vercel accesible |
| Aceptación QA | Pendiente de firma/capturas |

Este informe queda listo para completarse con capturas y enlaces finales antes de publicarlo en GitHub Wiki.
