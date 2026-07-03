# LAB 08 - Pruebas de Integración con Postman y Supertest

## 1. Estado del entregable

El LAB 08 queda implementado para el proyecto Workout Cool.

La sección propuesta del laboratorio pedía automatizar pruebas de integración y aplicar el criterio al proyecto final. En este proyecto se implementó una suite real sobre endpoints HTTP de Next.js App Router, validando persistencia, lectura, actualización, validación de errores, frontera entre subsistemas y resiliencia ante latencia.

Resultado actual:

| Elemento | Estado |
|----------|--------|
| API REST básica o flujo API real | Implementado sobre flujo real de Workout Sessions |
| POST -> GET | Cubierto |
| Actualización de estado -> GET | Cubierto |
| Datos inválidos con HTTP 400 | Cubierto |
| Caso sintáctico | Cubierto |
| Caso semántico | Cubierto |
| Caso de resiliencia | Cubierto |
| Uso de Vitest como runner | Cubierto |
| Base de datos de prueba | Cubierto según ambiente informado |
| Limpieza de datos de prueba | Cubierto |
| Documentación | Este archivo |

## 2. Ambiente utilizado

| Elemento | Valor |
|----------|-------|
| Proyecto | Workout Cool |
| Framework | Next.js App Router |
| Lenguaje | TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Auth | Better Auth |
| Validación | Zod y next-safe-action |
| Runner | Vitest |
| Cliente HTTP de integración | `fetch` contra servidor Next local |
| Coverage unitario | V8, conservado en `vitest.config.ts` |
| Despliegue | `https://workout-cool-ten.vercel.app/` |

La base de datos conectada al ambiente indicado por el equipo se considera base exclusiva de pruebas, por lo que la ejecución del laboratorio puede crear y eliminar datos controlados.

### Puertos de ejecución

Hay dos formas locales de ejecutar el proyecto:

| Uso | Comando | URL | Motivo |
|-----|---------|-----|--------|
| Desarrollo normal | `pnpm dev` | `http://localhost:3000` | Es el puerto por defecto de Next.js para trabajar manualmente en la aplicación |
| Pruebas de integración | `pnpm test:integration` | `http://127.0.0.1:3101` | La suite levanta un servidor aislado para no chocar con un `pnpm dev` que ya esté usando el puerto 3000 |

La diferencia es intencional. El puerto `3000` queda libre para desarrollo, navegador o Postman manual. El puerto `3101` lo controla Vitest durante la ejecución automatizada y se apaga al finalizar la suite.

La forma recomendada es dejar que `pnpm test:integration` levante el servidor aislado en `3101`.

Si se desea ejecutar la suite contra un servidor ya levantado manualmente en `3000`, ese servidor debe iniciarse con la variable de laboratorio para que el caso de resiliencia pueda simular latencia:

```bash
LAB08_INTEGRATION_TESTS=true pnpm dev
```

Luego, en otra terminal:

```bash
TEST_SERVER_URL=http://localhost:3000 pnpm test:integration
```

En ese caso, la suite reutiliza el servidor existente en lugar de levantar uno propio. Si se ejecuta `pnpm dev` sin `LAB08_INTEGRATION_TESTS=true`, los casos normales pueden responder, pero el caso de resiliencia no tendría la latencia simulada.

## 3. Despliegue disponible

URL del despliegue:

```txt
https://workout-cool-ten.vercel.app/
```

Verificación realizada:

| Recurso | Resultado |
|---------|-----------|
| `GET https://workout-cool-ten.vercel.app/` | HTTP 307 hacia `/en` |
| `GET https://workout-cool-ten.vercel.app/api/programs` | HTTP 200 |

Cuenta de prueba disponible en la base de datos:

| Campo | Valor |
|-------|-------|
| User ID | `TTEEJ9BP74nYMSa2YFEU6IbWbHTFfIBn` |
| Email | `test@gmail.com` |
| Password | Credencial de prueba compartida por el responsable del ambiente. No se registra en este archivo para evitar dejar contraseñas en el repositorio. |

Nota: la suite automatizada no depende de esa cuenta fija. Para que las pruebas sean repetibles, cada ejecución crea un usuario nuevo mediante Better Auth y lo elimina al terminar.

## 4. Por qué no se usó Supertest directamente

Supertest funciona de forma natural con servidores Express o handlers Node tradicionales. Este proyecto usa Next.js App Router, donde los endpoints viven en archivos `route.ts` y se ejecutan dentro del runtime de Next.

Por esa razón se eligió una estrategia equivalente y compatible:

1. Vitest inicia un servidor local de Next.js.
2. La suite ejecuta requests HTTP reales con `fetch`.
3. Los endpoints pasan por el mismo pipeline que en producción:
   - routing de Next.js,
   - cookies de Better Auth,
   - validación Zod,
   - server actions,
   - Prisma,
   - PostgreSQL.

Esta estrategia cumple el objetivo del laboratorio porque no prueba funciones aisladas, sino integración real entre subsistemas.

## 5. Flujo elegido

El flujo elegido fue `workout-sessions`.

Motivo de selección:

- Es un flujo central del dominio del sistema.
- Crea datos reales en PostgreSQL.
- Lee datos persistidos.
- Actualiza una propiedad cuantitativa (`rating`).
- Usa autenticación.
- Usa validación.
- Usa Prisma y relaciones entre tablas.
- Permite simular errores de interfaz entre subsistemas.

Endpoints usados:

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| POST | `/api/auth/sign-up/email` | Crear usuario de prueba y obtener cookie real de sesión |
| POST | `/api/workout-sessions/sync` | Crear o sincronizar una sesión de entrenamiento |
| GET | `/api/workout-sessions/user/:userId` | Leer sesiones persistidas del usuario |
| POST | `/api/workout-sessions/:sessionId/rating` | Actualizar rating cuantitativo de la sesión |
| GET | `/api/workout-sessions/:sessionId/summary` | Leer resumen y verificar estado actualizado |

## 6. Frontera de integración probada

La frontera principal probada es:

```txt
Cliente HTTP
  -> Next.js API Route
  -> Better Auth session cookie
  -> Zod / next-safe-action
  -> Prisma Client
  -> PostgreSQL
  -> Respuesta JSON
```

Esto valida que los módulos no solo funcionen individualmente, sino que puedan comunicarse correctamente entre sí.

Subsistemas integrados:

| Subsistema | Evidencia en la prueba |
|------------|------------------------|
| HTTP/API | Requests reales contra endpoints `app/api` |
| Auth | Cookie real emitida por Better Auth |
| Validación | Payload inválido produce HTTP 400 |
| Lógica de negocio | `syncWorkoutSessionAction` valida usuario y ejercicios |
| Persistencia | Prisma crea `WorkoutSession`, ejercicios asociados y sets |
| PostgreSQL | Los datos se leen después de ser escritos |
| Resiliencia | Timeout controlado con request abortado |

## 7. Archivos agregados o modificados

### Configuración

| Archivo | Propósito |
|---------|-----------|
| `vitest.integration.config.ts` | Configuración exclusiva para pruebas de integración |
| `vitest.config.ts` | Excluye integración de las pruebas unitarias normales |
| `package.json` | Agrega scripts `test:integration` y `test:integration:watch` |

### Suite de integración

| Archivo | Propósito |
|---------|-----------|
| `src/test/integration/global-setup.ts` | Arranca servidor local Next para la suite |
| `src/test/integration/helpers/http.ts` | Helper HTTP con cookies, JSON y timeout |
| `src/test/integration/helpers/workout-session-fixtures.ts` | Crea usuario, ejercicio, payload y limpieza de DB |
| `src/test/integration/workout-sessions.integration.test.ts` | Casos del LAB 08 |

### Ajustes mínimos en API

| Archivo | Cambio |
|---------|--------|
| `app/api/workout-sessions/sync/route.ts` | Normaliza respuesta de `next-safe-action`, devuelve HTTP 400 para validación y errores semánticos controlados |
| `app/api/workout-sessions/user/[userId]/route.ts` | Agrega latencia simulada solo si `LAB08_INTEGRATION_TESTS=true` |

## 8. Scripts agregados

```json
{
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "test:integration:watch": "vitest --config vitest.integration.config.ts"
}
```

Comando principal:

```bash
pnpm test:integration
```

Comando para modo observación:

```bash
pnpm test:integration:watch
```

Las pruebas unitarias existentes siguen usando:

```bash
pnpm test
```

## 9. Datos creados por la suite

Cada ejecución genera un identificador único:

```txt
lab08-<uuid>
```

Con ese prefijo se crean:

- usuario de prueba,
- ejercicio de prueba,
- sesión de entrenamiento,
- sets de entrenamiento.

Después de la ejecución se eliminan:

- `workout_sessions` generadas,
- ejercicios generados,
- usuario generado,
- relaciones dependientes mediante cascadas de Prisma.

Esto evita depender de datos manuales y permite repetir el test varias veces.

## 10. Casos automatizados

Archivo:

```txt
src/test/integration/workout-sessions.integration.test.ts
```

### LAB08-INT-01: POST -> GET

Objetivo:

Validar que un recurso creado por POST se puede leer después por GET usando datos persistidos.

Pasos:

1. Crear usuario de prueba con `POST /api/auth/sign-up/email`.
2. Crear ejercicio de prueba con Prisma.
3. Enviar sesión de entrenamiento a `POST /api/workout-sessions/sync`.
4. Consultar sesiones del usuario con `GET /api/workout-sessions/user/:userId`.
5. Verificar que la sesión creada existe.
6. Verificar que el ejercicio y sets fueron persistidos.

Resultado esperado:

- HTTP 200 en POST.
- HTTP 200 en GET.
- La sesión aparece con el mismo ID.
- La sesión pertenece al usuario autenticado.
- Los sets asociados existen.

Correspondencia con el laboratorio:

- Ejercicio propuesto 1, flujo de persistencia cruzada.

### LAB08-INT-02: Actualización -> GET

Objetivo:

Actualizar una propiedad cuantitativa y verificar que el cambio se guardó.

Propiedad actualizada:

```txt
rating
```

Pasos:

1. Enviar `rating: 5` a `POST /api/workout-sessions/:sessionId/rating`.
2. Consultar `GET /api/workout-sessions/:sessionId/summary`.
3. Verificar que el resumen devuelve `rating: 5`.
4. Verificar también métricas calculadas:
   - total de sets,
   - total de repeticiones,
   - volumen total.

Resultado esperado:

- HTTP 200.
- `rating` persistido correctamente.
- `ratingComment` persistido correctamente.
- Métricas de resumen correctas.

Correspondencia con el laboratorio:

- Ejercicio propuesto 1, modificación de estado.

### LAB08-INT-03: Caso inválido HTTP 400

Objetivo:

Validar robustez ante datos inválidos.

Payload usado:

```json
{
  "rating": 9
}
```

Motivo del error:

El schema exige `rating` entero entre 1 y 5.

Resultado esperado:

- HTTP 400.
- Respuesta con `error: "INVALID_INPUT"`.
- Detalles de validación presentes.

Correspondencia con el laboratorio:

- Ejercicio propuesto 1, robustez y edge cases.
- Ejercicio propuesto 2, caso sintáctico.

### LAB08-INT-04: Caso semántico

Objetivo:

Enviar un objeto técnicamente válido, pero inválido para la lógica del sistema.

Payload:

- JSON válido.
- Tipos correctos.
- Estructura correcta.
- `exerciseId` inexistente en PostgreSQL.

Motivo del error:

La sesión intenta conectarse con un ejercicio que no existe.

Resultado esperado:

- HTTP 400.
- Mensaje con `Exercises not found`.

Correspondencia con el laboratorio:

- Ejercicio propuesto 2, caso semántico.

### LAB08-INT-05: Resiliencia por timeout

Objetivo:

Verificar comportamiento ante latencia alta.

Estrategia:

1. El endpoint `GET /api/workout-sessions/user/:userId` acepta una demora artificial solo cuando:

```txt
LAB08_INTEGRATION_TESTS=true
```

2. El test envía el header:

```txt
x-lab08-delay-ms: 250
```

3. El cliente HTTP usa un timeout menor:

```txt
timeoutMs: 25
```

Resultado esperado:

- El request es abortado por el cliente.
- La suite verifica que se produce error de timeout/abort.

Correspondencia con el laboratorio:

- Ejercicio propuesto 2, caso de resiliencia.

## 11. Evidencia de ejecución

### Pruebas de integración

Comando ejecutado:

```bash
pnpm test:integration
```

Resultado:

```txt
Test Files  1 passed (1)
Tests       5 passed (5)
```

Casos cubiertos:

```txt
5/5 passed
```

Salida representativa de la ejecución:

```txt
GET /api/programs 200
POST /api/auth/sign-up/email 200
POST /api/workout-sessions/sync 200
GET /api/workout-sessions/user/:userId 200
POST /api/workout-sessions/:sessionId/rating 200
GET /api/workout-sessions/:sessionId/summary 200
POST /api/workout-sessions/:sessionId/rating 400
POST /api/workout-sessions/sync 400

Test Files  1 passed (1)
Tests       5 passed (5)
```

### Matriz de resultados esperado vs obtenido

| ID | Caso | Resultado esperado | Resultado obtenido | Estado | Falla registrada |
|----|------|--------------------|--------------------|--------|------------------|
| LAB08-INT-01 | Crear sesión con POST y leer con GET | HTTP 200 en creación, HTTP 200 en lectura, sesión persistida con ejercicios y sets | `POST /api/workout-sessions/sync 200` y `GET /api/workout-sessions/user/:userId 200` | Aprobado | No |
| LAB08-INT-02 | Actualizar rating y verificar con summary | HTTP 200, `rating: 5`, comentario y métricas persistidas | `POST /rating 200` y `GET /summary 200` | Aprobado | No |
| LAB08-INT-03 | Enviar rating inválido | HTTP 400 con `INVALID_INPUT` y detalles de validación | `POST /rating 400` | Aprobado | No |
| LAB08-INT-04 | Enviar `exerciseId` inexistente | HTTP 400 con mensaje `Exercises not found` | `POST /api/workout-sessions/sync 400` | Aprobado | No |
| LAB08-INT-05 | Simular latencia alta y timeout | Request abortado por timeout del cliente | Test finaliza con error esperado capturado por Vitest | Aprobado | No |

### Registro de fallas

Durante la ejecución final no quedaron fallas abiertas.

| ID | Descripción | Severidad | Estado | Acción tomada |
|----|-------------|-----------|--------|---------------|
| REG-LAB08-01 | El endpoint de sincronización devolvía la forma interna de `next-safe-action`, dificultando validar `data.id` directamente | Media | Corregida | Se normalizó la respuesta en `app/api/workout-sessions/sync/route.ts` |
| REG-LAB08-02 | El caso semántico de ejercicio inexistente no devolvía HTTP 400 inicialmente | Media | Corregida | Se asignó HTTP 400 para `Exercises not found` |
| REG-LAB08-03 | El sandbox local impedía abrir puertos para el servidor Next de prueba | Baja | Controlada | La suite se ejecuta correctamente en ambiente normal; en Codex requirió permiso elevado para abrir el puerto local |

Conclusión del registro: las fallas encontradas durante la implementación fueron corregidas o controladas. La ejecución final del LAB 08 quedó en estado aprobado.

### Pruebas unitarias existentes

Comando ejecutado:

```bash
pnpm test
```

Resultado:

```txt
Test Files  76 passed (76)
Tests       509 passed (509)
```

Esto confirma que las pruebas de integración no rompieron las pruebas unitarias existentes.

### Lint focalizado

Se ejecutó ESLint sobre los archivos agregados o modificados del laboratorio.

Resultado:

```txt
0 errores
```

Nota: `pnpm lint` completo se inició, pero se detuvo manualmente porque permaneció varios minutos sin finalizar. No había emitido errores hasta ese punto. Para el entregable se verificó lint sobre los archivos modificados.

## 12. Equivalencia con Postman

Aunque la automatización final se hizo con Vitest y `fetch`, los mismos casos pueden ejecutarse manualmente en Postman.

### Variables sugeridas en Postman

| Variable | Valor |
|----------|-------|
| `baseUrl` | `https://workout-cool-ten.vercel.app` |
| `localBaseUrl` | `http://localhost:3000` para pruebas manuales con `pnpm dev` |
| `integrationBaseUrl` | `http://127.0.0.1:3101` para la suite automatizada |
| `userId` | ID del usuario autenticado |
| `sessionId` | ID de sesión creada |
| `cookie` | Cookie de Better Auth obtenida en login/sign-up |

### Secuencia manual equivalente

1. Crear o iniciar sesión de usuario.
2. Copiar cookie de sesión.
3. Ejecutar `POST /api/workout-sessions/sync`.
4. Ejecutar `GET /api/workout-sessions/user/:userId`.
5. Ejecutar `POST /api/workout-sessions/:sessionId/rating`.
6. Ejecutar `GET /api/workout-sessions/:sessionId/summary`.
7. Ejecutar caso inválido con `rating: 9`.
8. Ejecutar caso semántico con `exerciseId` inexistente.

## 13. Criterios de aceptación del laboratorio

| Criterio | Cumplimiento | Evidencia |
|----------|--------------|-----------|
| Crear recurso con POST | Sí | `POST /api/workout-sessions/sync` |
| Leer recurso con GET | Sí | `GET /api/workout-sessions/user/:userId` |
| Usar ID generado/controlado | Sí | `session.id` con prefijo `lab08-<uuid>` |
| Actualizar propiedad cuantitativa | Sí | `rating` |
| Verificar cambio persistido | Sí | `GET /api/workout-sessions/:sessionId/summary` |
| Responder 400 ante input inválido | Sí | `rating: 9` |
| Caso sintáctico | Sí | Validación Zod |
| Caso semántico | Sí | `exerciseId` inexistente |
| Caso resiliencia | Sí | Latencia + abort por timeout |
| Integración API -> validación -> Prisma -> PostgreSQL | Sí | Flujo completo de Workout Sessions |
| No romper unitarias | Sí | `509 passed` |
| Documentación | Sí | Este archivo |

## 14. Conclusión

El LAB 08 está completo para la sección propuesta.

La implementación no se limita a pruebas unitarias ni a mocks aislados. La suite levanta un servidor Next.js real, autentica un usuario con Better Auth, crea datos en PostgreSQL mediante Prisma, consulta esos datos por API, actualiza estado, valida errores de entrada y cubre un caso de resiliencia.

Por lo tanto, el entregable cumple los objetivos del laboratorio:

- automatización de pruebas de integración,
- validación de persistencia cruzada,
- modificación de estado,
- robustez ante errores,
- análisis de fronteras entre subsistemas,
- casos sintácticos, semánticos y de resiliencia aplicados al proyecto final.
