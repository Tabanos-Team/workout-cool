# Resumen del trabajo Bruno

## Objetivo

Crear y validar pruebas de integracion con Bruno para los modulos `premium-billing` y `analytics` del proyecto Workout Cool.

## Repositorios usados

- API revisada: `https://github.com/Tabanos-Team/workout-cool`
- Colecciones Bruno modificadas: `https://github.com/Tabanos-Team/workout-cool-postman`

El repositorio `workout-cool` se uso solo como referencia para leer los route handlers y contratos de respuesta. No se modifico ese repositorio.

## Instalacion realizada

Se instalo Bruno CLI globalmente con npm:

```bash
npm install -g @usebruno/cli
bru --version
```

Version instalada/verificada: `3.5.1`.

## Colecciones creadas

### Premium Billing

Carpeta: `Premium Billing/`

Requests creadas:

- `Get Premium Plans - LATAM`: valida `GET /api/premium/plans` con provider `stripe` y region `LATAM`.
- `Get Premium Plans - Timezone Detection`: valida deteccion de region por timezone `America/Lima`.
- `Get Premium Status - Anonymous`: valida el comportamiento anonimo de `GET /api/premium/status`.
- `Get Billing Status - Requires Auth`: valida que `GET /api/billing/status` rechaza usuarios anonimos con `401`.
- `Create Checkout - Authenticated`: valida el contrato JSON de `POST /api/premium/checkout` con sesion.
- `Create Billing Portal - Authenticated`: valida el contrato JSON de `POST /api/premium/billing-portal` con sesion.
- `Get Premium Status - Authenticated`: valida el contrato autenticado de `GET /api/premium/status`.
- `Get Billing Status - Authenticated`: valida el contrato autenticado de `GET /api/billing/status`.

### Analytics

Carpeta: `Analytics/`

Requests creadas:

- `Track Premium Discovery`
- `Track Paywall Viewed`
- `Track Paywall Purchased`
- `Track Paywall Cancelled`
- `Track Purchases Restored`
- `Reject Invalid Premium Event`

Estos requests validan `POST /api/analytics/premium` para todos los eventos permitidos y para el caso negativo `invalid_event`.

## Variables agregadas a environments

Se agregaron a `Local`, `Integration` y `QA Vercel`:

- `PremiumProvider`: `stripe`
- `PremiumRegion`: `LATAM`
- `PremiumTimezone`: `America/Lima`
- `PremiumPlanId`: vacio por defecto; se llena desde `Get Premium Plans - LATAM` si existen planes.
- `BillingReturnUrl`: URL de retorno para el portal de billing.

## Validacion ejecutada

### Analytics QA

Comando:

```bash
bru run Analytics -r --env 'QA Vercel' --reporter-json /tmp/workout-cool-analytics-qa.json
```

Resultado:

- Requests: `6/6` pasaron.
- Tests: `11/11` pasaron.
- Estado final: `PASS`.

### Premium Billing QA publico/anonimo

Comando:

```bash
bru run 'Premium Billing' -r --env 'QA Vercel' --exclude-tags authenticated --reporter-json /tmp/workout-cool-premium-public-qa.json
```

Resultado:

- Requests: `4/4` pasaron.
- Tests: `9/9` pasaron.
- Estado final: `PASS`.

Se excluyen los requests con tag `authenticated` porque requieren una sesion creada por `Auth/Sign-in` dentro de la misma corrida.

### Login y sesion QA

Comando:

```bash
bru run Auth/Sign-in.yml Usuarios/profile.yml --env 'QA Vercel' --reporter-json /tmp/workout-cool-auth-profile-sequence-qa.json
```

Resultado:

- `Auth/Sign-in`: `200 OK`.
- `Usuarios/profile`: `200 OK` cuando se ejecuta en la misma corrida, confirmando persistencia de cookies en Bruno CLI.

### Premium Billing autenticado QA

Comando:

```bash
bru run Auth/Sign-in.yml 'Premium Billing/Get Premium Status - Authenticated.yml' 'Premium Billing/Get Billing Status - Authenticated.yml' 'Premium Billing/Get Premium Plans - LATAM.yml' 'Premium Billing/Create Checkout - Authenticated.yml' 'Premium Billing/Create Billing Portal - Authenticated.yml' --env 'QA Vercel' --reporter-json /tmp/workout-cool-premium-auth-expanded-qa.json
```

Resultado:

- Requests: `6/6` pasaron.
- Tests: `11/11` pasaron.
- Estado final: `PASS`.
- `Get Premium Status - Authenticated`: `200 OK`, contrato de estado premium valido.
- `Get Billing Status - Authenticated`: `200 OK`, contrato de estado billing valido.
- `Get Premium Plans - LATAM`: `200 OK`, pero QA devolvio `plans: []` para LATAM.
- `Create Checkout - Authenticated`: `400 Bad Request` con `Plan ID is required`, esperado porque no hay planes disponibles en QA para poblar `PremiumPlanId`.
- `Create Billing Portal - Authenticated`: `400 Bad Request` con `No Stripe customer found. Please subscribe first.`, esperado para el usuario de prueba sin cliente Stripe.

## Sustento tecnico

Los tests se derivaron de estos route handlers del repositorio `workout-cool`:

- `app/api/premium/plans/route.ts`
- `app/api/premium/status/route.ts`
- `app/api/billing/status/route.ts`
- `app/api/premium/checkout/route.ts`
- `app/api/premium/billing-portal/route.ts`
- `app/api/analytics/premium/route.ts`

Se uso el formato OpenCollection YAML de Bruno. Las validaciones estan en `runtime.scripts` con `type: tests`, usando `test(...)` y `expect(...)`.

## Observaciones

- Para que checkout cree una URL real, QA necesita planes activos disponibles para la region/proveedor usado o se debe configurar `PremiumPlanId` manualmente con un plan valido.
- Para que billing portal devuelva URL real, el usuario autenticado debe tener un cliente Stripe asociado.
- Los endpoints autenticados deben ejecutarse en la misma corrida que `Auth/Sign-in` para que Bruno CLI conserve cookies.
