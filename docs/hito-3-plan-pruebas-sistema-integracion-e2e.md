# HITO 3 - Plan de Pruebas de Sistema, Integración, E2E, Aceptación y CI/CD

## 1. Objetivo del HITO 3

Definir el plan técnico y funcional de pruebas para validar el proyecto Workout Cool en una etapa cercana a producción. El HITO 3 busca comprobar que los módulos principales funcionan de manera integrada, que los flujos críticos cumplen los criterios de aceptación del usuario final y que el despliegue se apoya en un proceso CI/CD automatizado.

El resultado esperado es una documentación lista para publicarse en GitHub Wiki, con trazabilidad entre módulos, endpoints, tipos de prueba, herramientas, ambientes, riesgos, evidencias y criterios de entrada y salida.

## 2. Contexto técnico del proyecto

| Elemento | Descripción |
|----------|-------------|
| Framework | Next.js con App Router |
| Lenguaje | TypeScript |
| Arquitectura | Feature-Sliced Design en `src/features`, rutas API en `app/api` |
| Base de datos | PostgreSQL/Neon mediante Prisma |
| Autenticación | Better Auth |
| Validación | Zod, React Hook Form y next-safe-action |
| UI | Shadcn UI, Radix, Tailwind CSS |
| Unit testing | Vitest, jsdom, React Testing Library, coverage V8 |
| Integración actual | Vitest + `fetch` contra servidor local Next para Auth/User, Workout Sessions, Exercises, Programs y Premium Status |
| CI | GitHub Actions en `.github/workflows/ci.yml` |
| CD | Vercel |
| Despliegue QA | `https://workout-cool-ten.vercel.app/` |

Nota importante: en este repositorio los endpoints de App Router están en `app/api`, no en `src/app/api`.

## 3. Alcance de las pruebas

### 3.1 Incluido

- Validación de módulos funcionales principales.
- Revisión de endpoints disponibles.
- Pruebas unitarias existentes con Vitest.
- Pruebas de integración existentes del LAB 08.
- Diseño de pruebas de sistema para flujos completos.
- Pruebas E2E iniciales con Playwright para páginas públicas y APIs públicas.
- Diseño de colecciones Postman/Newman para pruebas manuales y automatizables.
- Revisión del flujo CI/CD actual con GitHub Actions y Vercel.
- Definición de criterios de aceptación para QA.
- Definición de evidencias requeridas para el informe final.

### 3.2 Fuera de alcance inmediato

- Pruebas reales de pago contra tarjetas productivas.
- Pruebas destructivas sobre proveedores externos en producción.
- Pruebas de carga de alto volumen.
- Pruebas de seguridad ofensiva avanzadas.
- Automatización completa de E2E autenticado; inicialmente se cubren smoke tests públicos.
- Automatización completa de Postman si no se instala Newman.

## 4. Diferencia entre tipos de prueba

| Tipo | Objetivo | Nivel | Herramientas sugeridas | Ejemplo en Workout Cool |
|------|----------|-------|------------------------|--------------------------|
| Unitarias | Validar funciones, schemas, componentes o hooks aislados | Bajo | Vitest, React Testing Library | Validar schema de signup o utilidad de conversión de peso |
| Integración | Validar comunicación entre subsistemas internos | Medio | Vitest + `fetch`, Supertest si aplica, Prisma test DB | API route -> Better Auth -> Zod -> Prisma -> PostgreSQL |
| Sistema | Validar que un flujo completo del sistema funciona en ambiente integrado | Alto | Postman, Playwright, ejecución manual QA | Usuario inicia sesión, crea sesión, ve historial y estadísticas |
| Aceptación | Confirmar que el sistema cumple los criterios del usuario/negocio | Alto | Checklist QA, Postman, Playwright, evidencia manual | Usuario puede registrarse, completar entrenamiento y consultar progreso |
| E2E | Simular navegación real de usuario en navegador | Alto | Playwright | Registro -> onboarding -> crear workout -> finalizar sesión |

## 5. Ambientes de prueba

| Ambiente | URL / Recurso | Uso | Responsable |
|----------|---------------|-----|-------------|
| Local dev | `http://localhost:3000` | Desarrollo y pruebas manuales | Desarrollador |
| Local integración | `http://127.0.0.1:3101` | Servidor levantado por `pnpm test:integration` | Suite automatizada |
| QA Vercel | `https://workout-cool-ten.vercel.app/` | Validación funcional, Postman y aceptación | Equipo QA |
| Base de datos QA | Neon PostgreSQL | Persistencia de pruebas controladas | Equipo backend |
| CI | GitHub Actions | Lint, unitarias, coverage, integración, E2E y build | Repositorio |
| CD | Vercel | Build y despliegue automático | Vercel |

## 6. Inventario de módulos funcionales

| Prioridad | Módulo | Ubicación principal | Motivo de prueba |
|-----------|--------|---------------------|------------------|
| Alta | Auth / registro / login / logout | `src/features/auth`, `app/api/auth` | Controla identidad, sesiones y acceso |
| Alta | Usuario / perfil / preferencias | `app/api/user`, `src/features/user` | Datos personales y onboarding |
| Alta | Workout sessions | `src/features/workout-session`, `app/api/workout-sessions` | Flujo principal de entrenamiento e integración automatizada |
| Alta | Programs | `src/features/programs`, `app/api/programs` | Programas, enrolamiento y progreso |
| Alta | Exercises | `src/features/workout-builder`, `app/api/exercises` | Catálogo, selección y estadísticas por ejercicio |
| Media | Statistics | `src/features/statistics`, `app/api/exercises/:id/statistics` | Métricas y visualización de progreso |
| Media | Premium / billing | `src/features/premium`, `app/api/premium`, `app/api/billing` | Acceso a features premium y checkout |
| Media | RevenueCat / Stripe webhooks | `app/api/webhooks`, `app/api/revenuecat` | Sincronización externa de suscripciones |
| Media | Admin | `src/features/admin`, `app/[locale]/(admin)` | Administración de programas y usuarios |
| Media | Leaderboard | `src/features/leaderboard` | Ranking y posición de usuario |
| Baja | Tools públicos | `app/[locale]/(app)/tools` | Calculadoras BMI, calorías y zonas cardíacas |
| Baja | Contact / feedback / email | `src/features/contact`, `src/features/email` | Soporte y comunicación |

## 7. Endpoints por módulo

### 7.1 Auth

| Método | URL | Descripción | Tipo de prueba sugerida | Herramienta |
|--------|-----|-------------|-------------------------|-------------|
| POST | `/api/auth/signup` | Registro custom con validación Zod | Integración, sistema, aceptación | Postman, Vitest + fetch |
| GET/POST | `/api/auth/[...all]` | Endpoints Better Auth: sign-up, sign-in, session, sign-out | Sistema, E2E | Postman, Playwright |

### 7.2 Usuario

| Método | URL | Descripción | Tipo de prueba sugerida | Herramienta |
|--------|-----|-------------|-------------------------|-------------|
| GET | `/api/user/profile` | Obtener perfil autenticado | Integración, sistema | Postman, Vitest + fetch |
| PUT | `/api/user/profile` | Actualizar nombre, apellido o imagen | Integración, sistema | Postman, Vitest + fetch |
| GET | `/api/user/preferences` | Obtener preferencias de onboarding | Integración, sistema | Postman, Vitest + fetch |
| PUT | `/api/user/preferences` | Actualizar preferencias con Zod | Integración, sistema | Postman, Vitest + fetch |
| PUT | `/api/user/password` | Cambiar contraseña | Sistema, aceptación | Postman, Playwright |

### 7.3 Workout sessions

| Método | URL | Descripción | Tipo de prueba sugerida | Herramienta |
|--------|-----|-------------|-------------------------|-------------|
| POST | `/api/workout-sessions/sync` | Crear/sincronizar sesión con ejercicios y sets | Integración, sistema | Vitest + fetch, Postman |
| GET | `/api/workout-sessions/user/:userId` | Listar sesiones del usuario autenticado | Integración, sistema | Vitest + fetch, Postman |
| GET | `/api/workout-sessions/:sessionId/summary` | Resumen de métricas de una sesión | Integración, sistema | Vitest + fetch |
| POST | `/api/workout-sessions/:sessionId/rating` | Guardar rating cuantitativo | Integración, sistema | Vitest + fetch |
| POST | `/api/workout-sessions/:sessionId/feedback` | Guardar feedback de sesión | Integración, sistema | Postman |
| DELETE | `/api/workout-sessions/:sessionId` | Eliminar sesión | Integración, sistema | Postman, Vitest + fetch |

### 7.4 Exercises y statistics

| Método | URL | Descripción | Tipo de prueba sugerida | Herramienta |
|--------|-----|-------------|-------------------------|-------------|
| GET | `/api/exercises` | Buscar ejercicios por músculos/equipamiento | Integración, sistema | Postman, Vitest + fetch |
| GET | `/api/exercises/all` | Listar catálogo completo | Sistema | Postman |
| POST | `/api/exercises/shuffle` | Reemplazar/sugerir ejercicio | Integración, sistema | Postman, Vitest + fetch |
| GET | `/api/exercises/:exerciseId/statistics` | Estadísticas generales por ejercicio | Integración, sistema | Postman |
| GET | `/api/exercises/:exerciseId/statistics/volume` | Volumen por ejercicio | Integración, sistema | Postman |
| GET | `/api/exercises/:exerciseId/statistics/weight-progression` | Progresión de peso | Integración, sistema | Postman |
| GET | `/api/exercises/:exerciseId/statistics/one-rep-max` | Estimación de 1RM | Integración, sistema | Postman |

### 7.5 Programs

| Método | URL | Descripción | Tipo de prueba sugerida | Herramienta |
|--------|-----|-------------|-------------------------|-------------|
| GET | `/api/programs` | Listar programas públicos | Sistema, aceptación | Postman, Playwright |
| GET | `/api/programs/:slug` | Obtener detalle de programa | Sistema, aceptación | Postman, Playwright |
| GET | `/api/programs/:slug/sessions/:sessionSlug` | Obtener detalle de sesión del programa | Sistema, aceptación | Postman |
| POST | `/api/programs/:slug/enroll` | Inscribir usuario en programa | Integración, sistema | Postman, Vitest + fetch |
| GET | `/api/programs/:slug/enroll` | Consultar estado de inscripción | Integración, sistema | Postman |
| GET | `/api/programs/:slug/progress` | Consultar progreso | Integración, sistema | Postman |
| POST | `/api/programs/session-progress/start` | Iniciar sesión de programa | Integración, sistema | Postman |
| POST | `/api/programs/session-progress/:progressId/complete` | Completar sesión de programa | Integración, sistema | Postman |

### 7.6 Premium, billing y analytics

| Método | URL | Descripción | Tipo de prueba sugerida | Herramienta |
|--------|-----|-------------|-------------------------|-------------|
| GET | `/api/premium/status` | Consultar estado premium del usuario | Integración, sistema | Postman |
| GET | `/api/premium/plans` | Consultar planes disponibles | Sistema | Postman |
| POST | `/api/premium/checkout` | Crear checkout premium | Integración controlada | Postman con mocks/staging |
| POST | `/api/premium/billing-portal` | Crear portal de facturación | Integración controlada | Postman con mocks/staging |
| GET | `/api/billing/status` | Consultar estado de billing | Sistema | Postman |
| POST | `/api/analytics/premium` | Registrar evento premium | Integración controlada | Postman |

### 7.7 Webhooks RevenueCat y Stripe

| Método | URL | Descripción | Tipo de prueba sugerida | Herramienta |
|--------|-----|-------------|-------------------------|-------------|
| POST | `/api/webhooks/stripe` | Webhook Stripe | Integración controlada | Postman, Stripe CLI |
| POST | `/api/webhooks/revenuecat` | Webhook RevenueCat principal | Integración controlada | Postman con firma |
| GET | `/api/webhooks/revenuecat` | Health check del webhook RevenueCat | Sistema | Postman |
| POST | `/api/revenuecat/webhook` | Webhook RevenueCat alternativo | Integración controlada | Postman |
| GET | `/api/revenuecat/link-user` | Vincular/consultar usuario RevenueCat | Sistema | Postman |
| POST | `/api/revenuecat/sync-status` | Sincronizar estado RevenueCat | Integración controlada | Postman |

### 7.8 Admin y páginas funcionales

| Recurso | Descripción | Tipo de prueba sugerida | Herramienta |
|---------|-------------|-------------------------|-------------|
| `/admin/dashboard` | Panel administrador | E2E, aceptación | Playwright, QA manual |
| `/admin/programs` | Gestión de programas | E2E, aceptación | Playwright, QA manual |
| `/admin/users` | Gestión de usuarios | E2E, aceptación | Playwright, QA manual |
| `/programs` | Catálogo de programas | Sistema, E2E | Playwright |
| `/profile` | Perfil de usuario | Sistema, E2E | Playwright |
| `/statistics` | Estadísticas | Sistema, E2E | Playwright |
| `/tools/bmi-calculator` | Calculadora BMI | Sistema, aceptación | Playwright |
| `/tools/calorie-calculator` | Calculadora de calorías | Sistema, aceptación | Playwright |
| `/tools/heart-rate-zones` | Zonas de frecuencia cardíaca | Sistema, aceptación | Playwright |

## 8. Plan de colecciones Postman

### 8.1 Colecciones sugeridas

| Colección | Objetivo |
|-----------|----------|
| `WorkoutCool - Auth` | Registro, login, sesión y logout |
| `WorkoutCool - User` | Perfil, preferencias y password |
| `WorkoutCool - Workout Sessions` | Crear, listar, actualizar rating, feedback, summary y eliminar |
| `WorkoutCool - Exercises and Statistics` | Búsqueda, catálogo, shuffle y estadísticas |
| `WorkoutCool - Programs` | Listado, detalle, inscripción y progreso |
| `WorkoutCool - Premium Billing` | Estado premium, planes y checkout en staging |
| `WorkoutCool - Webhooks` | Simulación controlada de Stripe y RevenueCat |

### 8.2 Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `baseUrl` | URL QA desplegada | `https://workout-cool-ten.vercel.app` |
| `localBaseUrl` | URL local manual | `http://localhost:3000` |
| `integrationBaseUrl` | URL suite integración | `http://127.0.0.1:3101` |
| `email` | Usuario de prueba | `test@gmail.com` |
| `password` | Password de prueba | Guardar solo en entorno local/Postman, no en Git |
| `cookie` | Cookie Better Auth | Se captura tras login/sign-up |
| `userId` | ID de usuario autenticado | Variable dinámica |
| `sessionId` | ID de sesión workout | Variable dinámica |
| `programSlug` | Slug de programa | Variable dinámica o fixture |
| `exerciseId` | ID de ejercicio | Variable dinámica o fixture |

### 8.3 Flujos positivos

| Flujo | Pasos | Resultado esperado |
|-------|-------|--------------------|
| Auth | sign-up/login -> get session | Usuario autenticado y cookie válida |
| Perfil | GET profile -> PUT profile -> GET profile | Datos actualizados |
| Preferencias | PUT preferences -> GET preferences | Preferencias persistidas |
| Workout | POST sync -> GET list -> POST rating -> GET summary | Sesión creada y rating persistido |
| Exercises | GET exercises con filtros válidos | Lista de ejercicios |
| Programs | GET programs -> GET detail -> enroll -> progress | Programa visible y progreso consistente |
| Premium status | Login -> GET premium/status | Estado premium coherente con DB |

### 8.4 Flujos negativos

| Flujo | Entrada inválida | Resultado esperado |
|-------|------------------|--------------------|
| Auth | Email inválido o password corto | HTTP 400 |
| Profile | Imagen con URL inválida | HTTP 400 |
| Preferences | `weeklyFrequency` fuera de 1..7 | HTTP 400 |
| Workout rating | `rating: 9` | HTTP 400 |
| Workout sync | `exerciseId` inexistente | HTTP 400 |
| Exercises | Sin músculos/equipamiento requeridos | HTTP 400 o 404 según caso |
| Programs | Slug inexistente | HTTP 404 |
| Premium checkout | Usuario no autenticado | HTTP 401 |
| Webhooks | Firma inválida | HTTP 400/401 |

## 9. Plan de automatización

### 9.1 Scripts existentes

| Script | Estado | Uso |
|--------|--------|-----|
| `pnpm lint` | Existente | Lint general |
| `pnpm build` | Existente | Build Next |
| `pnpm test` | Existente | Pruebas unitarias |
| `pnpm test:watch` | Existente | Unitarias en watch |
| `pnpm test:coverage` | Existente | Coverage V8 |
| `pnpm test:integration` | Existente | Integración HITO 3 sobre Auth/User, Workout, Exercises, Programs y Premium |
| `pnpm test:integration:watch` | Existente | Integración en watch |
| `pnpm test:integration:programs:deployed` | Existente | Integración Programs contra Vercel/Neon con limpieza |
| `pnpm test:integration:programs:deployed:keep` | Existente | Integración Programs contra Vercel/Neon conservando evidencia |
| `pnpm test:e2e` | Existente | Playwright E2E smoke tests |
| `pnpm test:e2e:programs:deployed` | Existente | Playwright E2E del modulo Programs contra Vercel |
| `pnpm test:e2e:ui` | Existente | Playwright E2E en modo UI |

### 9.2 Scripts sugeridos

Estos scripts son mejoras pendientes o complementarias para completar HITO 3:

| Script sugerido | Objetivo | Requiere |
|-----------------|----------|----------|
| `test:postman` | Ejecutar colección Postman con Newman | Instalar `newman` |
| `test:ci` | Ejecutar lint, unitarias, integración y build | Ajuste de scripts |

Ejemplo futuro:

```json
{
  "test:postman": "newman run postman/workoutcool.postman_collection.json -e postman/qa.postman_environment.json"
}
```

### 9.3 Ejecución local recomendada

```bash
pnpm install
pnpm prisma generate
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:integration
pnpm test:e2e
pnpm build
```

### 9.4 Ejecución CI actual

El workflow `.github/workflows/ci.yml` ejecuta:

| Job | Pasos |
|-----|-------|
| `quality` | checkout, setup pnpm, Node 22, install, Prisma generate, lint, test, coverage y artifact de coverage |
| `integration` | PostgreSQL 16 temporal, Prisma migrate deploy y `pnpm test:integration` |
| `e2e` | PostgreSQL 16 temporal, Chromium Playwright, Prisma migrate deploy, `pnpm test:e2e` y artifact de reporte |
| `build` | checkout, setup pnpm, Node 22, install, Prisma generate y build con variables dummy |

### 9.5 Mejora recomendada para CI

| Mejora | Motivo |
|--------|--------|
| Mantener `pnpm test:integration` en CI | Incluir integración HITO 3 en cada push/PR |
| Usar servicio PostgreSQL ephemeral | Evitar tocar DB productiva durante CI |
| Publicar coverage como artifact | Evidencia para informe |
| Publicar reporte Playwright como artifact | Evidencia E2E |
| Ejecutar Newman si se crea colección Postman | Automatizar pruebas de API |
| Separar secrets QA de secrets producción | Seguridad |

## 10. Casos de integración por módulo

| ID | Módulo | Caso | Entrada | Resultado esperado | Prioridad |
|----|--------|------|---------|--------------------|-----------|
| INT-AUTH-01 | Auth | Registro válido | Email y password válidos | Usuario creado, sesión/cookie disponible | Alta |
| INT-AUTH-02 | Auth | Registro inválido | Email inválido | HTTP 400 | Alta |
| INT-USER-01 | User profile | Actualizar perfil | `firstName`, `lastName` | GET posterior refleja cambios | Alta |
| INT-USER-02 | Preferences | Guardar preferencias | Objetivos, nivel, frecuencia | Preferencias persistidas | Alta |
| INT-WKT-01 | Workout sessions | POST sync -> GET list | Sesión con ejercicio válido | Sesión persistida | Alta |
| INT-WKT-02 | Workout sessions | Rating -> summary | `rating: 5` | Summary refleja rating | Alta |
| INT-WKT-03 | Workout sessions | Input inválido | `rating: 9` | HTTP 400 | Alta |
| INT-EXE-01 | Exercises | Buscar ejercicios | Músculo y equipo válidos | Lista no vacía | Alta |
| INT-EXE-02 | Statistics | Consultar estadísticas | `exerciseId` con sesiones | Métricas calculadas | Media |
| INT-PROG-01 | Programs | Listar programas | Sin auth | Programas públicos | Alta |
| INT-PROG-02 | Programs | Enroll | Usuario autenticado y slug válido | Enrolamiento creado | Alta |
| INT-PROG-03 | Programs | Completar sesión | `progressId` válido | Progreso actualizado | Alta |
| INT-PREM-01 | Premium | Consultar estado | Usuario autenticado | Estado premium coherente | Media |
| INT-PREM-02 | Premium | Checkout sin auth | Sin cookie | HTTP 401 | Media |
| INT-WH-01 | Stripe webhook | Firma inválida | Payload sin firma válida | Rechazo controlado | Media |
| INT-WH-02 | RevenueCat webhook | Evento sandbox válido | Payload firmado | DB sincronizada | Media |

## 11. Casos E2E sugeridos

| ID | Flujo E2E | Pasos principales | Resultado esperado | Prioridad |
|----|-----------|------------------|--------------------|-----------|
| E2E-01 | Registro e ingreso | Abrir app, signup/login, verificar sesión | Usuario autenticado ve estado logueado | Alta |
| E2E-02 | Onboarding/preferencias | Login, abrir onboarding, guardar preferencias | Preferencias persisten | Alta |
| E2E-03 | Crear entrenamiento | Elegir equipo, músculos, ejercicios, iniciar sesión | Sesión activa creada | Alta |
| E2E-04 | Finalizar workout | Completar sets, finalizar, ver historial | Sesión aparece en historial | Alta |
| E2E-05 | Rating de sesión | Abrir sesión finalizada, calificar | Rating persistido | Alta |
| E2E-06 | Programas | Abrir programas, detalle, inscribirse | Enrolamiento y progreso visibles | Alta |
| E2E-07 | Estadísticas | Completar workout, abrir statistics | Métricas visibles | Media |
| E2E-08 | Premium | Abrir pricing, iniciar checkout en staging | Redirección controlada | Media |
| E2E-09 | Admin | Login admin, listar usuarios/programas | Panel accesible para admin | Media |
| E2E-10 | Tools públicos | Abrir BMI/calorías, ingresar datos | Resultado calculado correctamente | Baja |

## 12. Casos de aceptación QA

| ID | Historia / necesidad | Criterio de aceptación | Evidencia requerida |
|----|----------------------|------------------------|--------------------|
| QA-01 | Usuario puede registrarse | Registro válido crea cuenta y sesión | Captura de formulario y sesión |
| QA-02 | Usuario puede iniciar sesión | Login válido permite acceso a perfil | Captura de perfil |
| QA-03 | Usuario puede guardar preferencias | Preferencias se mantienen al recargar | Captura antes/después |
| QA-04 | Usuario puede crear entrenamiento | Selección de músculos/equipo genera ejercicios | Captura del builder |
| QA-05 | Usuario puede finalizar sesión | Historial muestra la sesión | Captura de historial |
| QA-06 | Usuario puede calificar sesión | Summary muestra rating | Captura o respuesta API |
| QA-07 | Usuario puede consultar programas | Lista y detalle cargan correctamente | Captura de programas |
| QA-08 | Usuario puede inscribirse a programa | Progreso inicial aparece | Captura de progreso |
| QA-09 | Usuario no premium ve restricciones | Feature premium bloqueada | Captura del bloqueo |
| QA-10 | Admin puede acceder a panel | Usuario admin ve dashboard | Captura admin |
| QA-11 | Tools públicos calculan resultados | Inputs válidos producen cálculo | Captura de resultado |

## 13. Criterios de entrada

Antes de ejecutar pruebas de sistema y aceptación:

- El branch debe estar actualizado.
- Dependencias instaladas con `pnpm install`.
- Prisma Client generado con `pnpm prisma generate`.
- Variables de entorno QA configuradas.
- Base Neon QA disponible.
- Usuario de prueba disponible.
- Datos mínimos de ejercicios importados.
- Despliegue Vercel QA accesible.
- Colección Postman preparada si aplica.
- Playwright instalado si se ejecutarán E2E.

## 14. Criterios de salida

El HITO 3 se considera completado cuando:

- `pnpm test` pasa.
- `pnpm test:coverage` genera reporte.
- `pnpm test:integration` pasa o las fallas quedan registradas.
- Casos Postman críticos ejecutados con evidencia.
- Casos E2E críticos ejecutados o marcados como pendientes justificados.
- Incidentes documentados con severidad.
- Evidencias adjuntas en Wiki.
- CI GitHub Actions finaliza correctamente.
- Despliegue Vercel QA responde.
- QA aprueba criterios de aceptación prioritarios.

## 15. Riesgos y limitaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| DB QA compartida puede tener datos residuales | Resultados no deterministas | Usar prefijos `hito3-` y limpieza por prueba |
| Webhooks requieren firmas válidas | Dificulta pruebas manuales | Usar Stripe CLI y payloads sandbox |
| Checkout real no debe ejecutarse en producción | Riesgo de transacciones reales | Usar staging/mocks/proveedor sandbox |
| E2E depende de navegadores Playwright instalados | Puede fallar si Chromium no existe en local/CI | Ejecutar `pnpm exec playwright install chromium` |
| Postman no está versionado | Menor trazabilidad | Crear carpeta `postman/` |
| Secrets en CI | Riesgo de exposición | Usar GitHub Secrets y no subir credenciales |
| Pruebas de integración requieren red y DB | Pueden fallar por disponibilidad externa | Usar DB test estable o PostgreSQL ephemeral |

## 16. Evidencias que el equipo debe capturar

| Evidencia | Formato sugerido |
|-----------|------------------|
| Resultado `pnpm test` | Captura o log |
| Resultado `pnpm test:coverage` | Captura de consola y carpeta `coverage` |
| Resultado `pnpm test:integration` | Captura o log |
| Requests Postman | Export collection + capturas |
| E2E Playwright | HTML report + video/screenshot si aplica |
| GitHub Actions | URL del workflow |
| Vercel deployment | URL del deployment |
| Base de datos QA | Captura de tablas o logs controlados |
| Incidentes | Tabla con severidad y acción |
| Aceptación QA | Checklist firmado o aprobado |

## 17. Publicación en GitHub Wiki

Contenido sugerido para Wiki:

| Página Wiki | Archivo fuente |
|-------------|----------------|
| `HITO 3 - Plan de pruebas` | `docs/hito-3-plan-pruebas-sistema-integracion-e2e.md` |
| `HITO 3 - Informe de resultados` | `docs/hito-3-informe-resultados-pruebas.md` |
| `LAB 08 - Integración` | `docs/lab-08-integration-tests.md` |
| `Plan de pruebas unitarias` | `docs/unit-test-plan.md` |
| `Flujos de integración Auth DB Premium` | `docs/integration-flow-auth-db-premium.md` |
| `Pruebas funcionales entrenamiento` | `docs/functional-test-training.md` |

Pasos:

1. Abrir GitHub Wiki del repositorio.
2. Crear página nueva con el nombre indicado.
3. Copiar el contenido Markdown.
4. Adjuntar capturas o links de evidencia.
5. Guardar versión.
6. Enlazar la página desde el índice de la Wiki.

## 18. Recomendaciones técnicas

1. Ampliar Playwright desde smoke tests públicos hacia flujos autenticados críticos.
2. Agregar Newman si se decide versionar Postman.
3. Mantener `pnpm test:integration` y `pnpm test:e2e` en el workflow CI con PostgreSQL temporal.
4. Publicar y adjuntar los artifacts de coverage y Playwright generados por GitHub Actions.
5. Mantener datos de prueba con prefijos únicos y limpieza automática.
6. Separar secretos QA de secretos productivos.
7. Mantener la suite actual de integración como base y ampliarla hacia webhooks/premium checkout en sandbox.

## 19. Conclusión del plan

El proyecto ya cuenta con una base sólida de pruebas unitarias y una suite real de integración para Auth/User, Workout Sessions, Exercises, Programs y Premium Status. Para completar HITO 3 con nivel de entrega académico y técnico, se debe complementar la cobertura con pruebas de sistema manuales/Postman, aceptación, E2E y CI/CD. Este plan define la ruta, los módulos prioritarios, los endpoints, las herramientas y las evidencias necesarias para publicar el proceso completo en GitHub Wiki.
