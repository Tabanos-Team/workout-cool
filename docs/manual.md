# Manual de Ejecución de Pruebas Manuales y Postman - HITO 3

## 1. Objetivo

Este manual indica cómo ejecutar pruebas manuales y pruebas de API con Postman para validar Workout Cool durante el HITO 3. Complementa las pruebas automatizadas con Vitest y sirve como guía para QA, docentes o integrantes del equipo que necesiten reproducir los flujos principales sin modificar código.

## 2. Ambientes

| Ambiente | URL | Uso |
|----------|-----|-----|
| Local desarrollo | `http://localhost:3000` | Pruebas manuales con `pnpm dev` |
| Integración automatizada | `http://127.0.0.1:3101` | Servidor levantado por `pnpm test:integration` |
| QA Vercel | `https://workout-cool-ten.vercel.app` | Pruebas manuales, Postman y aceptación |

Para levantar localmente:

```bash
pnpm dev
```

Para correr integración automatizada:

```bash
pnpm test:integration
```

## 3. Herramientas necesarias

| Herramienta | Uso |
|-------------|-----|
| Navegador Chrome/Firefox/Edge | Pruebas manuales de UI |
| Postman | Pruebas manuales de API |
| Terminal | Ejecutar scripts y registrar evidencias |
| GitHub Actions | Evidencia CI |
| Vercel Dashboard | Evidencia CD |

Opcional:

| Herramienta | Uso |
|-------------|-----|
| Newman | Automatizar colecciones Postman |
| Playwright | Automatizar E2E, ya configurado en el proyecto |
| Stripe CLI | Probar webhooks Stripe en sandbox |

## 4. Variables de entorno en Postman

Crear un environment llamado:

```txt
WorkoutCool QA
```

Variables recomendadas:

| Variable | Valor sugerido | Descripción |
|----------|----------------|-------------|
| `baseUrl` | `https://workout-cool-ten.vercel.app` | URL QA desplegada |
| `localBaseUrl` | `http://localhost:3000` | URL local manual |
| `email` | `test@gmail.com` | Usuario de prueba |
| `password` | Guardar solo en Postman | Password del usuario de prueba |
| `cookie` | Se completa tras login/sign-up | Cookie Better Auth |
| `userId` | Se completa tras login/sign-up | ID del usuario |
| `sessionId` | Se completa tras crear workout | ID de sesión |
| `exerciseId` | Se completa desde catálogo | ID de ejercicio |
| `programSlug` | Se completa desde programas | Slug de programa |

No subir el environment con credenciales reales al repositorio.

## 5. Cómo autenticar en Postman

### Opción A: Usar el endpoint Better Auth

Request:

```txt
POST {{baseUrl}}/api/auth/sign-in/email
```

Body JSON:

```json
{
  "email": "{{email}}",
  "password": "{{password}}"
}
```

Resultado esperado:

- HTTP 200.
- Respuesta con usuario o token según Better Auth.
- Header `Set-Cookie` con cookie de sesión.

Después del request:

1. Ir a la pestaña `Cookies` de Postman.
2. Copiar la cookie `better-auth.session_token` si Postman no la gestiona automáticamente.
3. Guardarla en `cookie` con formato:

```txt
better-auth.session_token=<valor>
```

En requests protegidos agregar header:

```txt
Cookie: {{cookie}}
```

### Opción B: Iniciar sesión en navegador y copiar cookie

1. Abrir `{{baseUrl}}`.
2. Iniciar sesión con el usuario de prueba.
3. Abrir DevTools.
4. Ir a Application -> Cookies.
5. Copiar la cookie `better-auth.session_token`.
6. Guardarla en Postman como `cookie`.

## 6. Colecciones sugeridas

Crear estas carpetas dentro de una colección Postman llamada:

```txt
WorkoutCool - HITO 3
```

| Carpeta | Propósito |
|---------|-----------|
| `01 Auth` | Registro, login, sesión, logout |
| `02 User` | Perfil, preferencias, password |
| `03 Workout Sessions` | Crear, listar, calificar, summary, eliminar |
| `04 Exercises` | Catálogo, filtros, casos inválidos |
| `05 Programs` | Listar, detalle, inscripción, progreso |
| `06 Premium` | Estado premium, planes |
| `07 Webhooks` | Stripe/RevenueCat sandbox |
| `08 Public Tools` | Validación manual en navegador |

## 7. Casos Postman por módulo

### 7.1 Auth

| ID | Request | Body / Entrada | Esperado |
|----|---------|----------------|----------|
| PM-AUTH-01 | `POST /api/auth/sign-up/email` | Email nuevo y password válido | HTTP 200, usuario creado |
| PM-AUTH-02 | `POST /api/auth/sign-in/email` | Email/password válidos | HTTP 200, cookie de sesión |
| PM-AUTH-03 | `POST /api/auth/sign-in/email` | Password incorrecto | HTTP 400/401 |
| PM-AUTH-04 | `GET /api/auth/session` | Cookie válida | HTTP 200, sesión activa |

### 7.2 User profile

| ID | Request | Entrada | Esperado |
|----|---------|---------|----------|
| PM-USER-01 | `GET /api/user/profile` | Cookie válida | HTTP 200, datos del usuario |
| PM-USER-02 | `GET /api/user/profile` | Sin cookie | HTTP 401 |
| PM-USER-03 | `PUT /api/user/profile` | `firstName`, `lastName`, `image` válida | HTTP 200 |
| PM-USER-04 | `PUT /api/user/profile` | `image: "no-url"` | HTTP 400 |

Body válido:

```json
{
  "firstName": "QA",
  "lastName": "Tester",
  "image": "https://workout-cool-ten.vercel.app/avatar.png"
}
```

### 7.3 User preferences

| ID | Request | Entrada | Esperado |
|----|---------|---------|----------|
| PM-PREF-01 | `PUT /api/user/preferences` | Preferencias válidas | HTTP 200 |
| PM-PREF-02 | `GET /api/user/preferences` | Cookie válida | HTTP 200, preferencias guardadas |
| PM-PREF-03 | `PUT /api/user/preferences` | `weeklyFrequency: 8` | HTTP 400 |

Body válido:

```json
{
  "goals": ["strength", "consistency"],
  "fitnessLevel": "beginner",
  "equipment": ["BODY_ONLY"],
  "muscles": ["CHEST"],
  "duration": 45,
  "weeklyFrequency": 3,
  "notificationDays": [1, 3, 5],
  "notificationTime": "07:30"
}
```

### 7.4 Workout Sessions

| ID | Request | Entrada | Esperado |
|----|---------|---------|----------|
| PM-WKT-01 | `POST /api/workout-sessions/sync` | Sesión válida | HTTP 200, `success: true` |
| PM-WKT-02 | `GET /api/workout-sessions/user/{{userId}}` | Cookie válida | HTTP 200, lista de sesiones |
| PM-WKT-03 | `POST /api/workout-sessions/{{sessionId}}/rating` | `rating: 5` | HTTP 200 |
| PM-WKT-04 | `GET /api/workout-sessions/{{sessionId}}/summary` | Cookie válida | HTTP 200, summary |
| PM-WKT-05 | `POST /api/workout-sessions/{{sessionId}}/rating` | `rating: 9` | HTTP 400 |
| PM-WKT-06 | `DELETE /api/workout-sessions/{{sessionId}}` | Cookie válida | HTTP 200 |

Body rating válido:

```json
{
  "rating": 5,
  "ratingComment": "Good QA workout"
}
```

Body rating inválido:

```json
{
  "rating": 9
}
```

Nota: para `POST /api/workout-sessions/sync` se recomienda usar datos generados por la suite automatizada o crear previamente un `exerciseId` existente.

### 7.5 Exercises

| ID | Request | Entrada | Esperado |
|----|---------|---------|----------|
| PM-EXE-01 | `GET /api/exercises/all?limit=10` | Query válida | HTTP 200, paginación |
| PM-EXE-02 | `GET /api/exercises?equipment=BODY_ONLY&muscles=CHEST&limit=3` | Query válida | HTTP 200 o 404 si no hay datos |
| PM-EXE-03 | `GET /api/exercises?equipment=BODY_ONLY&muscles=CHEST&limit=99` | Límite inválido | HTTP 400 |
| PM-EXE-04 | `POST /api/exercises/shuffle` | Payload válido | HTTP 200 o 404 si no hay alternativas |
| PM-EXE-05 | `POST /api/exercises/shuffle` | Muscle inválido | HTTP 400 |

Body shuffle:

```json
{
  "muscle": "CHEST",
  "equipment": ["BODY_ONLY"],
  "excludeExerciseIds": []
}
```

### 7.6 Programs

| ID | Request | Entrada | Esperado |
|----|---------|---------|----------|
| PM-PROG-01 | `GET /api/programs` | Sin auth | HTTP 200 |
| PM-PROG-02 | `GET /api/programs/{{programSlug}}` | Slug válido | HTTP 200 |
| PM-PROG-03 | `GET /api/programs/no-existe` | Slug inválido | HTTP 404 |
| PM-PROG-04 | `POST /api/programs/{{programSlug}}/enroll` | Cookie válida | HTTP 200 |
| PM-PROG-05 | `GET /api/programs/{{programSlug}}/enroll` | Cookie válida | HTTP 200 |
| PM-PROG-06 | `POST /api/programs/{{programSlug}}/enroll` | Sin cookie | HTTP 401 |

### 7.7 Premium

| ID | Request | Entrada | Esperado |
|----|---------|---------|----------|
| PM-PREM-01 | `GET /api/premium/status` | Sin cookie | HTTP 200, `isPremium: false` |
| PM-PREM-02 | `GET /api/premium/status` | Cookie válida | HTTP 200, estado premium |
| PM-PREM-03 | `GET /api/premium/plans?region=US` | Región explícita | HTTP 200, `plans` array |
| PM-PREM-04 | `POST /api/premium/checkout` | Cookie válida, plan sandbox | HTTP 200 o error controlado |

No ejecutar checkout real con credenciales productivas.

### 7.8 Webhooks

| ID | Request | Entrada | Esperado |
|----|---------|---------|----------|
| PM-WH-01 | `GET /api/webhooks/revenuecat` | Sin body | HTTP 200 |
| PM-WH-02 | `POST /api/webhooks/stripe` | Sin firma | HTTP 400/401 |
| PM-WH-03 | `POST /api/webhooks/revenuecat` | Firma inválida | HTTP 400/401 |

Para pruebas reales de webhook usar:

- Stripe CLI en modo sandbox.
- Payloads firmados de RevenueCat sandbox.
- Base de datos QA.

## 8. Pruebas manuales de UI

### 8.1 Auth

| ID | Pasos | Esperado | Evidencia |
|----|-------|----------|-----------|
| UI-AUTH-01 | Abrir app, registrarse o iniciar sesión | Usuario queda autenticado | Captura de estado logueado |
| UI-AUTH-02 | Intentar login inválido | Mensaje de error | Captura del error |

### 8.2 Workout

| ID | Pasos | Esperado | Evidencia |
|----|-------|----------|-----------|
| UI-WKT-01 | Seleccionar equipo y músculos | Se muestran ejercicios sugeridos | Captura del builder |
| UI-WKT-02 | Iniciar sesión de entrenamiento | Pantalla de sesión activa | Captura |
| UI-WKT-03 | Completar sets y finalizar | Historial muestra sesión | Captura historial |
| UI-WKT-04 | Calificar sesión | Rating visible | Captura summary |

### 8.3 Programs

| ID | Pasos | Esperado | Evidencia |
|----|-------|----------|-----------|
| UI-PROG-01 | Abrir `/programs` | Lista de programas | Captura |
| UI-PROG-02 | Abrir detalle de programa | Información y sesiones visibles | Captura |
| UI-PROG-03 | Inscribirse | Progreso inicial visible | Captura |

### 8.4 Tools públicos

| ID | Pasos | Esperado | Evidencia |
|----|-------|----------|-----------|
| UI-TOOLS-01 | Abrir BMI calculator, ingresar datos | Resultado BMI correcto | Captura |
| UI-TOOLS-02 | Abrir calorie calculator, ingresar datos | Calorías estimadas | Captura |
| UI-TOOLS-03 | Abrir heart-rate zones, ingresar datos | Zonas calculadas | Captura |

## 9. Registro de resultados

Usar esta tabla para cada ejecución manual:

| ID | Fecha | Módulo | Tipo | Entrada | Resultado esperado | Resultado obtenido | Estado | Evidencia | Responsable |
|----|-------|--------|------|---------|--------------------|--------------------|--------|-----------|-------------|
| PM-AUTH-01 | 2026-07-06 | Auth | Postman | Login válido | HTTP 200 | Completar | Pendiente | Link/captura | Completar |

Estados permitidos:

- Aprobado.
- Fallido.
- Bloqueado.
- Pendiente.

## 10. Registro de incidencias

| ID | Fecha | Módulo | Descripción | Severidad | Pasos para reproducir | Resultado esperado | Resultado real | Estado |
|----|-------|--------|-------------|-----------|-----------------------|--------------------|----------------|--------|
| INC-001 | 2026-07-06 | Completar | Completar | Alta/Media/Baja | Completar | Completar | Completar | Abierto |

Severidad sugerida:

| Severidad | Criterio |
|-----------|----------|
| Alta | Bloquea login, datos críticos, pagos o flujo principal |
| Media | Afecta una funcionalidad importante con alternativa |
| Baja | Problema visual, texto o caso no crítico |

## 11. Evidencias mínimas para GitHub Wiki

| Evidencia | Requerido |
|-----------|-----------|
| Captura de `pnpm test` | Sí |
| Captura de `pnpm test:integration` | Sí |
| Captura de Postman Runner | Sí, cuando exista colección |
| Captura de Vercel deployment | Sí |
| Link de GitHub Actions | Sí |
| Capturas UI de aceptación | Sí |
| Tabla de incidentes | Sí |

## 12. Cierre de ejecución

Antes de cerrar una ronda de QA:

1. Confirmar que los casos críticos fueron ejecutados.
2. Registrar resultados esperados y obtenidos.
3. Adjuntar capturas.
4. Registrar incidentes.
5. Verificar que no se dejaron datos de prueba innecesarios.
6. Publicar o actualizar GitHub Wiki.
7. Comunicar el estado final al equipo.

## 13. Relación con automatización

Los casos manuales más importantes deben convertirse gradualmente en automatizados:

| Manual | Automatización sugerida |
|--------|--------------------------|
| Login | Playwright |
| Profile/preferences | Vitest integración |
| Workout sync/rating | Ya cubierto por Vitest integración |
| Programs enroll | Vitest integración / Playwright |
| Exercises filters | Vitest integración |
| Premium status | Vitest integración |
| Tools públicos | Playwright |

## 14. Ejecución E2E con Playwright

El proyecto incluye Playwright para smoke tests de páginas públicas y APIs públicas.

Comando:

```bash
pnpm test:e2e
```

Modo UI:

```bash
pnpm test:e2e:ui
```

Si el ambiente no tiene navegador Chromium instalado:

```bash
pnpm exec playwright install chromium
```

Los reportes se generan en:

```txt
playwright-report/index.html
```

Casos cubiertos inicialmente:

- `/en`
- `/en/programs`
- `/en/premium`
- `/en/tools`
- `/en/tools/bmi-calculator`
- `/en/tools/calorie-calculator`
- `/en/tools/heart-rate-zones`
- `/api/programs`
- `/api/premium/plans?region=US`
- `/api/webhooks/revenuecat`

Este manual queda listo para ejecutarse y copiarse a GitHub Wiki como guía operativa del HITO 3.
