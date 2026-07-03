# Plan de Pruebas de Sistema y Criterios de Aceptación (Hito 3)

**Código del Documento:** DOC-03  
**Estado:** Diseñado  
**Rama:** JCG  

---

## 1. Objetivos del Plan de Pruebas

El objetivo principal de este plan es definir, estructurar y detallar el alcance de las pruebas de integración y del sistema aplicadas sobre la interfaz de programación de aplicaciones (API) del proyecto **workout-cool**. 

### Alcance Técnico
* **Autenticación e Identidad:** Cobertura de registro de usuario personalizado (`/api/auth/signup`), inicio y cierre de sesión gestionados por Better Auth.
* **Gestión de Ejercicios:** Validación de la lógica de negocio para listados paginados, búsquedas de texto plano con filtros de grupo muscular/equipamiento, algoritmos de selección alternativa (Shuffle) y acceso a estadísticas premium.
* **Gestión de Rutinas y Entrenamientos:** Cobertura sobre la creación y sincronización de sesiones (Prisma Upsert), resúmenes de rendimiento (volumen de carga, repeticiones y estimación de calorías quemadas vía MET), gestión de progreso de programas estructurados de entrenamiento y feedback del usuario.
* **Control de Errores e Integridad:** Verificación de robustez ante solicitudes con parámetros incorrectos (Zod schemas), control de accesos no autorizados (HTTP 401/403) e inexistencia de recursos (HTTP 404).

---

## 2. Matriz de Cobertura de Pruebas

| ID Caso | Módulo | Endpoint / Acción | Descripción del Caso | Criterio de Error Relacionado |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Autenticación | `POST /api/auth/signup` | Registro exitoso de nuevo usuario. | N/A |
| **AUTH-02** | Autenticación | `POST /api/auth/signup` | Intento de registro con correo duplicado. | HTTP 409 (`EMAIL_ALREADY_EXISTS`) |
| **AUTH-03** | Autenticación | `POST /api/auth/signup` | Intento de registro con datos incompletos. | HTTP 400 (`INVALID_INPUT`) |
| **AUTH-04** | Autenticación | `POST /api/auth/sign-in/email` | Inicio de sesión con credenciales correctas. | N/A |
| **AUTH-05** | Autenticación | `POST /api/auth/sign-in/email` | Inicio de sesión con credenciales incorrectas. | HTTP 401 Unauthorized |
| **AUTH-06** | Autenticación | `POST /api/auth/sign-out` | Cierre de sesión y destrucción de cookies. | N/A |
| **EXER-01** | Ejercicios | `GET /api/exercises` | Filtrado básico de ejercicios por músculo/equipo. | N/A |
| **EXER-02** | Ejercicios | `GET /api/exercises` | Filtrado con tipos de datos inválidos (Zod). | HTTP 400 (`INVALID_INPUT`) |
| **EXER-03** | Ejercicios | `GET /api/exercises` | Consulta de ejercicios sin coincidencias. | HTTP 404 (`NO_EXERCISES_FOUND`) |
| **EXER-04** | Ejercicios | `GET /api/exercises/all` | Listado paginado y búsqueda por nombre. | N/A |
| **EXER-05** | Ejercicios | `GET /api/exercises/all` | Parámetros de paginación inválidos o fuera de límite. | HTTP 400 (`INVALID_PARAMETERS`) |
| **EXER-06** | Ejercicios | `POST /api/exercises/shuffle` | Reemplazo (Shuffle) aleatorio de ejercicio. | N/A |
| **EXER-07** | Ejercicios | `POST /api/exercises/shuffle` | Shuffle cuando no existen alternativas viables. | HTTP 404 (`NO_EXERCISES_FOUND`) |
| **EXER-08** | Ejercicios | `GET /api/exercises/[id]/statistics`| Obtención de métricas por usuario Premium. | N/A |
| **EXER-09** | Ejercicios | `GET /api/exercises/[id]/statistics`| Acceso denegado a estadísticas para usuario Free. | HTTP 403 (`PREMIUM_REQUIRED`) |
| **EXER-10** | Ejercicios | `GET /api/exercises/[id]/statistics`| Acceso sin sesión activa en estadísticas. | HTTP 401 (`UNAUTHORIZED`) |
| **ROUT-01** | Rutinas | `GET /api/programs` | Listado de programas públicos de entrenamiento. | N/A |
| **ROUT-02** | Rutinas | `GET /api/programs/[slug]` | Obtención de detalles de programa por Slug. | N/A |
| **ROUT-03** | Rutinas | `GET /api/programs/[slug]` | Intento de búsqueda de programa inexistente. | HTTP 404 Program not found |
| **ROUT-04** | Rutinas | `POST /api/programs/[slug]/enroll` | Inscripción a programa para usuario autenticado. | N/A |
| **ROUT-05** | Rutinas | `POST /api/programs/[slug]/enroll` | Inscripción a programa sin sesión activa. | HTTP 401 (`UNAUTHORIZED`) |
| **ROUT-06** | Rutinas | `GET /api/programs/[slug]/enroll` | Consulta del estado de inscripción del usuario. | N/A |
| **ROUT-07** | Rutinas | `GET /api/programs/[slug]/progress` | Obtener progreso cuantitativo del programa. | N/A (Retorna `null` si no está inscrito) |
| **ROUT-08** | Rutinas | `GET /api/.../sessions/[slug]` | Detalles de una sesión de programa en idioma específico. | HTTP 404 Session not found |
| **ROUT-09** | Rutinas | `POST /api/programs/session-progress/start` | Iniciar progreso de una sesión de programa. | HTTP 400 / HTTP 404 |
| **ROUT-10** | Rutinas | `POST /api/.../[progressId]/complete` | Completar sesión de programa y avanzar semana/sesión. | N/A |
| **ROUT-11** | Rutinas | `POST /api/.../[progressId]/complete` | Completar sesión sin proveer workoutSessionId. | HTTP 400 Missing workout session ID |
| **ROUT-12** | Rutinas | `POST /api/workout-sessions/sync` | Sincronización o creación de sesión de entrenamiento. | N/A |
| **ROUT-13** | Rutinas | `POST /api/workout-sessions/sync` | Sincronización con ejercicios o usuario inexistente. | HTTP 500 / HTTP 404 |
| **ROUT-14** | Rutinas | `GET /api/workout-sessions/user/[id]`| Historial de entrenamientos del usuario logueado. | HTTP 401 Unauthorized |
| **ROUT-15** | Rutinas | `GET /api/.../[sessionId]/summary` | Resumen de métricas calculadas y estimación de MET. | HTTP 404 Not Found / Unauthorized |
| **ROUT-16** | Rutinas | `POST /api/.../[sessionId]/rating` | Calificación (Rating 1-5 estrellas) de sesión. | HTTP 400 (`INVALID_INPUT`) / HTTP 404 |
| **ROUT-17** | Rutinas | `POST /api/.../[sessionId]/feedback`| Envío de feedback simplificado con emoji y texto. | HTTP 400 (`INVALID_INPUT`) |
| **ROUT-18** | Rutinas | `DELETE /api/workout-sessions/[id]` | Eliminación exitosa de sesión de entrenamiento. | N/A |
| **ROUT-19** | Rutinas | `DELETE /api/workout-sessions/[id]` | Intento de borrar una sesión ajena o inexistente. | HTTP 403 Unauthorized / 404 |

---

## 3. Detalle de Criterios de Aceptación (Formato Gherkin)

### Módulo: Autenticación / Registro de Usuarios

#### AUTH-01: Registro de usuario exitoso
```gherkin
Escenario: Registro exitoso de un nuevo usuario en el sistema
  Dado que el servicio de Better Auth está activo
  Y el correo electrónico "nuevo_usuario@workout.cool" no está registrado en la base de datos
  Cuando se envía una solicitud POST a "/api/auth/signup" con el siguiente cuerpo JSON:
    """
    {
      "email": "nuevo_usuario@workout.cool",
      "password": "PasswordSegura123",
      "firstName": "Carlos",
      "lastName": "Mendoza"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el JSON de respuesta debe incluir el objeto "user" con su identificador único ("id")
  Y debe retornar un "token" de sesión válido
  Y el rol del usuario en la base de datos debe ser asignado automáticamente como "user"
```

#### AUTH-02: Intento de registro con correo duplicado
```gherkin
Escenario: Rechazo de registro cuando el correo ya se encuentra en uso
  Dado que el correo "existente@workout.cool" ya está registrado en la base de datos de usuarios
  Cuando se envía una solicitud POST a "/api/auth/signup" con el siguiente cuerpo JSON:
    """
    {
      "email": "existente@workout.cool",
      "password": "OtraPassword123",
      "firstName": "Juan",
      "lastName": "Pérez"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 409 Conflict
  Y el JSON de respuesta debe ser:
    """
    {
      "error": "EMAIL_ALREADY_EXISTS"
    }
    """
```

#### AUTH-03: Intento de registro con datos incompletos
```gherkin
Escenario: Rechazo de registro debido a fallos en el esquema de validación Zod
  Cuando se envía una solicitud POST a "/api/auth/signup" con un correo electrónico inválido y contraseña corta:
    """
    {
      "email": "correo-invalido",
      "password": "123",
      "firstName": "",
      "lastName": "Gómez"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 400 Bad Request
  Y el JSON de respuesta debe contener el código de error:
    """
    {
      "error": "INVALID_INPUT"
    }
    """
  Y el objeto "details" debe detallar las reglas de validación que fallaron para cada campo
```

#### AUTH-04: Inicio de sesión con credenciales correctas
```gherkin
Escenario: Inicio de sesión exitoso con correo y contraseña
  Dado que existe un usuario registrado con el correo "usuario@workout.cool" y la contraseña "Segura12345"
  Cuando se envía una solicitud POST a "/api/auth/sign-in/email" con el siguiente cuerpo JSON:
    """
    {
      "email": "usuario@workout.cool",
      "password": "Segura12345"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el cliente debe recibir las cookies de sesión correspondientes
```

#### AUTH-05: Inicio de sesión con credenciales incorrectas
```gherkin
Escenario: Rechazo del inicio de sesión por credenciales incorrectas
  Dado que existe un usuario registrado con el correo "usuario@workout.cool"
  Cuando se envía una solicitud POST a "/api/auth/sign-in/email" con una contraseña incorrecta:
    """
    {
      "email": "usuario@workout.cool",
      "password": "PasswordIncorrecta"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 401 Unauthorized
```

#### AUTH-06: Cierre de sesión y destrucción de cookies
```gherkin
Escenario: Cierre de sesión de un usuario con sesión activa
  Dado que el usuario ha iniciado sesión y tiene una cookie de sesión válida
  Cuando se envía una solicitud POST a "/api/auth/sign-out"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y las cookies de autenticación del navegador o cliente deben ser invalidadas
```

---

### Módulo: Gestión de Ejercicios

#### EXER-01: Filtrado básico de ejercicios con parámetros válidos
```gherkin
Escenario: Obtención de ejercicios aplicando filtros de grupo muscular y equipamiento
  Dado que existen ejercicios clasificados con músculo "CHEST" y equipamiento "DUMBBELL" en la base de datos
  Cuando se envía una solicitud GET a "/api/exercises?muscles=CHEST&equipment=DUMBBELL&limit=2"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y debe retornar un array JSON con máximo 2 ejercicios
  Y cada ejercicio retornado debe poseer al menos uno de los atributos solicitados
```

#### EXER-02: Filtrado con tipos de datos inválidos (Zod)
```gherkin
Escenario: Solicitud rechazada por formato incorrecto de limitador en query
  Cuando se envía una solicitud GET a "/api/exercises?limit=cinco"
  Entonces la respuesta HTTP debe devolver un código de estado 400 Bad Request
  Y el JSON de respuesta debe incluir el código "INVALID_INPUT"
```

#### EXER-03: Consulta de ejercicios sin coincidencias
```gherkin
Escenario: No se encuentran ejercicios que coincidan con los filtros aplicados
  Dado que no existen ejercicios en la base de datos para el músculo "NECK" con equipamiento "SWISS_BALL"
  Cuando se envía una solicitud GET a "/api/exercises?muscles=NECK&equipment=SWISS_BALL"
  Entonces la respuesta HTTP debe devolver un código de estado 404 Not Found
  Y la respuesta debe ser exactamente:
    """
    {
      "error": "NO_EXERCISES_FOUND"
    }
    """
```

#### EXER-04: Listado paginado y búsqueda por nombre
```gherkin
Escenario: Consulta paginada con término de búsqueda
  Dado que existen múltiples ejercicios que contienen la palabra "Press" en su nombre
  Cuando se envía una solicitud GET a "/api/exercises/all?page=1&limit=5&search=Press"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y la respuesta debe contener un objeto "data" con la lista de ejercicios que coinciden
  Y un objeto "pagination" que contenga "page", "limit", "totalCount", "totalPages", "hasNextPage" y "hasPreviousPage"
  Y la cabecera de la respuesta debe incluir políticas de caché "Cache-Control" configuradas para 5 minutos
```

#### EXER-05: Parámetros de paginación inválidos o fuera de límite
```gherkin
Escenario: Control de parámetros de paginación fuera de los rangos definidos
  Cuando se envía una solicitud GET a "/api/exercises/all?limit=150"
  Entonces la respuesta HTTP debe devolver un código de estado 400 Bad Request
  Y el JSON de respuesta debe ser:
    """
    {
      "error": "INVALID_PARAMETERS",
      "message": "Invalid query parameters",
      "details": { ... }
    }
    """
```

#### EXER-06: Reemplazo (Shuffle) aleatorio de ejercicio
```gherkin
Escenario: Selección exitosa de una alternativa para un ejercicio específico
  Dado que existen al menos dos ejercicios registrados para el músculo "BICEPS" y equipamiento "DUMBBELL"
  Cuando se envía una solicitud POST a "/api/exercises/shuffle" con el siguiente cuerpo:
    """
    {
      "muscle": "BICEPS",
      "equipment": ["DUMBBELL"],
      "excludeExerciseIds": ["ex_actual_id"]
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el JSON de respuesta debe retornar un objeto "exercise"
  Y el ID del ejercicio retornado debe ser diferente a "ex_actual_id"
```

#### EXER-07: Shuffle de ejercicio sin alternativas viables
```gherkin
Escenario: Intento de shuffle cuando no hay más alternativas disponibles
  Dado que solo existe un ejercicio con músculo "LATS" y equipamiento "CAR" con ID "ex_unico"
  Cuando se envía una solicitud POST a "/api/exercises/shuffle" con el cuerpo:
    """
    {
      "muscle": "LATS",
      "equipment": ["CAR"],
      "excludeExerciseIds": ["ex_unico"]
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 404 Not Found
  Y la respuesta debe contener:
    """
    {
      "error": "NO_EXERCISES_FOUND"
    }
    """
```

#### EXER-08: Obtención de estadísticas por usuario Premium
```gherkin
Escenario: Acceso permitido a estadísticas de entrenamiento para usuarios premium
  Dado que existe un usuario autenticado con ID "usr_premium"
  Y este usuario tiene su estado "isPremium" registrado en verdadero
  Cuando se envía una solicitud GET a "/api/exercises/ex_123/statistics?timeframe=4_weeks"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el JSON debe contener las series para "weightProgression", "estimatedOneRepMax" y "volume"
```

#### EXER-09: Acceso denegado a estadísticas para usuario Free
```gherkin
Escenario: Denegación de acceso a estadísticas a usuarios que no poseen suscripción activa
  Dado que existe un usuario autenticado con ID "usr_free"
  Y este usuario tiene su estado "isPremium" registrado en falso o nulo
  Cuando se envía una solicitud GET a "/api/exercises/ex_123/statistics"
  Entonces la respuesta HTTP debe devolver un código de estado 403 Forbidden
  Y el JSON de respuesta debe coincidir con:
    """
    {
      "error": "PREMIUM_REQUIRED",
      "message": "Exercise statistics is a premium feature",
      "isPremium": false
    }
    """
```

#### EXER-10: Acceso sin sesión activa en estadísticas
```gherkin
Escenario: Bloqueo de acceso a recursos de estadísticas para clientes sin token
  Dado que no se proveen cookies ni tokens de sesión válidos en la cabecera
  Cuando se envía una solicitud GET a "/api/exercises/ex_123/statistics"
  Entonces la respuesta HTTP debe devolver un código de estado 401 Unauthorized
  Y la respuesta debe ser:
    """
    {
      "error": "UNAUTHORIZED",
      "message": "Authentication required"
    }
    """
```

---

### Módulo: Gestión de Rutinas / Entrenamientos

#### ROUT-01: Listar programas públicos de entrenamiento
```gherkin
Escenario: Obtención de todos los programas con estado de visibilidad publicado
  Dado que existen 3 programas en la base de datos con visibilidad "PUBLISHED" y 1 con visibilidad "DRAFT"
  Cuando se envía una solicitud GET a "/api/programs"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el array JSON retornado debe contener únicamente los 3 programas publicados
```

#### ROUT-02: Obtener detalles de un programa por su Slug
```gherkin
Escenario: Obtener estructura y fases de un programa mediante su identificador amigable
  Dado que existe un programa publicado con el slug "hipertrofia-brazos"
  Cuando se envía una solicitud GET a "/api/programs/hipertrofia-brazos"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el JSON de respuesta debe incluir todos los datos del programa, incluyendo sus semanas y sesiones recomendadas
```

#### ROUT-03: Intento de búsqueda de programa inexistente
```gherkin
Escenario: Petición de detalles de programa que no existe en el sistema
  Cuando se envía una solicitud GET a "/api/programs/slug-inexistente"
  Entonces la respuesta HTTP debe devolver un código de estado 404 Not Found
  Y la respuesta JSON debe ser:
    """
    {
      "error": "Failed to fetch program"
    }
    """
```

#### ROUT-04: Inscripción de usuario autenticado en un programa
```gherkin
Escenario: Registro de inscripción en un programa de entrenamiento
  Dado que existe un usuario autenticado con ID "usr_123"
  Y el programa con slug "fuerza-basicos" existe y tiene 10 participantes
  Cuando se envía una solicitud POST a "/api/programs/fuerza-basicos/enroll" con sesión activa
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el JSON de respuesta debe indicar que la inscripción es nueva ("isNew": true)
  Y el total de participantes ("totalEnrollments") devuelto debe ser 11
  Y la tabla "user_program_enrollments" de Prisma debe registrar la relación entre "usr_123" y el programa
```

#### ROUT-05: Inscripción a programa sin sesión activa
```gherkin
Escenario: Denegar la inscripción si el cliente no está autenticado
  Dado que el cliente no cuenta con credenciales válidas en la petición
  Cuando se envía una solicitud POST a "/api/programs/hipertrofia-brazos/enroll"
  Entonces la respuesta HTTP debe devolver un código de estado 401 Unauthorized
  Y el JSON de respuesta debe contener el código de error "UNAUTHORIZED"
```

#### ROUT-06: Consulta del estado de inscripción del usuario
```gherkin
Escenario: Obtener estado del usuario respecto a un programa específico
  Dado que el usuario con sesión activa ya está inscrito al programa con slug "fuerza-basicos"
  Cuando se envía una solicitud GET a "/api/programs/fuerza-basicos/enroll"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el cuerpo JSON debe contener:
    """
    {
      "isEnrolled": true,
      "enrollment": { ... }
    }
    """
```

#### ROUT-07: Obtener progreso cuantitativo del programa
```gherkin
Escenario: Obtención de estadísticas de avance de programa
  Dado que el usuario tiene un enrolamiento activo en el programa "fuerza-basicos"
  Y el programa tiene 12 sesiones totales en su planificación
  Y el usuario ha completado 3 sesiones de dicho programa
  Cuando se envía una solicitud GET a "/api/programs/fuerza-basicos/progress"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y las métricas devueltas en "stats" deben incluir:
    * "totalSessions": 12
    * "completedSessions": 3
    * "completionPercentage": 25
    * "isProgramCompleted": false
```

#### ROUT-08: Detalles de una sesión de programa en idioma específico
```gherkin
Escenario: Obtención de estructura de sesión traducida al inglés
  Dado que el programa "fuerza-basicos" contiene la sesión con slug "dia-1"
  Cuando se envía una solicitud GET a "/api/programs/fuerza-basicos/sessions/dia-1?locale=en"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y las descripciones, títulos e instrucciones de los ejercicios de la sesión deben ser devueltos en inglés
```

#### ROUT-09: Iniciar el progreso de una sesión de programa
```gherkin
Escenario: Inicio de sesión de entrenamiento y cambio de estatus en el progreso del programa
  Dado que el usuario está inscrito con "enrollmentId": "enroll_789"
  Y la sesión del programa con ID "sess_456" está asignada a la semana 1, sesión 1
  Cuando se envía una solicitud POST a "/api/programs/session-progress/start" con el cuerpo:
    """
    {
      "enrollmentId": "enroll_789",
      "sessionId": "sess_456"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el registro en "user_program_enrollments" debe actualizar su "currentWeek" a 1 y "currentSession" a 1
  Y el objeto retornado debe incluir "isNew": true y la estructura "sessionData"
```

#### ROUT-10: Completar sesión de programa y avanzar semana/sesión
```gherkin
Escenario: Finalización de una sesión que actualiza el estado al siguiente entrenamiento disponible
  Dado que el usuario tiene un progreso de sesión con ID "prog_abc"
  Y el entrenamiento actual corresponde a la semana 1, sesión 1 (de 3 sesiones semanales en total)
  Cuando se envía una solicitud POST a "/api/programs/session-progress/prog_abc/complete" con el cuerpo:
    """
    {
      "workoutSessionId": "work_session_999"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el objeto retornado debe indicar que el programa no está totalmente finalizado ("isCompleted": false)
  Y los valores sugeridos de la siguiente sesión deben ser "nextWeek": 1 y "nextSession": 2
```

#### ROUT-11: Completar sesión sin proveer workoutSessionId
```gherkin
Escenario: Rechazo de finalización de sesión por campos obligatorios faltantes
  Cuando se envía una solicitud POST a "/api/programs/session-progress/prog_abc/complete" con un cuerpo vacío
  Entonces la respuesta HTTP debe devolver un código de estado 400 Bad Request
  Y el JSON devuelto debe ser:
    """
    {
      "error": "Missing workout session ID"
    }
    """
```

#### ROUT-12: Sincronizar o creación de sesión de entrenamiento
```gherkin
Escenario: Sincronización offline exitosa de una sesión realizada en el cliente (Upsert)
  Dado que el usuario "usr_123" existe en la base de datos
  Y los IDs de ejercicios enviados existen en el catálogo
  Cuando se envía una solicitud POST a "/api/workout-sessions/sync" con la carga útil completa del entrenamiento:
    """
    {
      "session": {
        "id": "sesion_nueva_999",
        "userId": "usr_123",
        "startedAt": "2026-07-03T10:00:00Z",
        "endedAt": "2026-07-03T11:00:00Z",
        "status": "COMPLETED",
        "muscles": ["CHEST", "TRICEPS"],
        "rating": 5,
        "ratingComment": "Excelente bombeo muscular",
        "exercises": [
          {
            "id": "ex_bench_press",
            "order": 1,
            "sets": [
              {
                "id": "set_1",
                "setIndex": 1,
                "types": ["WEIGHT", "REPS"],
                "valuesInt": [10, 80],
                "units": ["kg"],
                "completed": true
              }
            ]
          }
        ]
      }
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y la sesión debe quedar guardada en la tabla "workout_sessions" con sus respectivos sets y ejercicios asociados
```

#### ROUT-13: Sincronización con ejercicios o usuario inexistente
```gherkin
Escenario: Rechazo de sincronización si algún ejercicio no existe en el catálogo global
  Dado que el ejercicio con ID "ex_no_existe" no está en el catálogo global
  Cuando se envía una solicitud POST a "/api/workout-sessions/sync" con una sesión que hace referencia a "ex_no_existe"
  Entonces la respuesta HTTP debe devolver un código de estado 500 Internal Server Error
  Y la respuesta JSON debe contener el mensaje detallado de que el ejercicio no existe
```

#### ROUT-14: Historial de entrenamientos del usuario actual
```gherkin
Escenario: Obtención de las sesiones previas realizadas por el usuario logueado
  Dado que el usuario tiene 2 entrenamientos terminados en su historial
  Cuando se envía una solicitud GET a "/api/workout-sessions/user/usr_123" con sesión iniciada
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y debe retornar un array JSON con 2 elementos formateados con sus ejercicios, sets asociados y fechas transformadas a ISO string
```

#### ROUT-15: Resumen de métricas calculadas y estimación de MET
```gherkin
Escenario: Consulta del resumen de rendimiento de una sesión completada
  Dado que la sesión "work_session_999" pertenece al usuario autenticado
  Y contiene 1 ejercicio con 3 series completadas de 10 repeticiones con 50 kg (Volumen total = 1500 kg)
  Y una duración registrada de 3600 segundos (1 hora)
  Cuando se envía una solicitud GET a "/api/workout-sessions/work_session_999/summary"
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y las métricas devueltas en "data" deben ser:
    * "totalSets": 3
    * "totalReps": 30
    * "totalVolume": 1500
    * "totalWeightLifted": 150
    * "caloriesBurned": 420 (Calculados con MET = 6 y peso asumido = 70 kg)
```

#### ROUT-16: Calificación (Rating) de sesión de entrenamiento
```gherkin
Escenario: Guardar calificación numérica a un entrenamiento realizado
  Dado que la sesión con ID "work_session_999" pertenece al usuario
  Cuando se envía una solicitud POST a "/api/workout-sessions/work_session_999/rating" con:
    """
    {
      "rating": 4,
      "ratingComment": "Estuvo intenso pero cansado"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el registro de la sesión en base de datos debe almacenar el rating y su respectivo comentario
```

#### ROUT-17: Envío de feedback simplificado con emoji y texto
```gherkin
Escenario: Guardar feedback simplificado para aplicación móvil
  Dado que la sesión "work_session_999" pertenece al usuario
  Cuando se envía una solicitud POST a "/api/workout-sessions/work_session_999/feedback" con:
    """
    {
      "feedbackEmoji": "😃",
      "feedbackText": "Sentí una gran progresión en fuerza"
    }
    """
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el JSON de respuesta debe confirmar el emoji y mapear el texto a "ratingComment"
```

#### ROUT-18: Eliminación exitosa de sesión de entrenamiento
```gherkin
Escenario: Eliminación física de un entrenamiento por su propietario
  Dado que la sesión con ID "work_session_999" existe y pertenece al usuario "usr_123"
  Cuando se envía una solicitud DELETE a "/api/workout-sessions/work_session_999" con la sesión de "usr_123" activa
  Entonces la respuesta HTTP debe devolver un código de estado 200 OK
  Y el JSON devuelto debe ser:
    """
    {
      "success": true
    }
    """
  Y el registro debe haber sido eliminado en la base de datos por cascada
```

#### ROUT-19: Intentar eliminar sesión de entrenamiento ajena o no existente
```gherkin
Escenario: Bloqueo de intento de eliminación de entrenamiento perteneciente a otro usuario
  Dado que existe la sesión "work_session_ajena" creada por el usuario "usr_otro"
  Y el usuario con sesión activa es "usr_123"
  Cuando se envía una solicitud DELETE a "/api/workout-sessions/work_session_ajena" con sesión activa de "usr_123"
  Entonces la respuesta HTTP debe devolver un código de estado 403 Forbidden o 404 Not Found
  Y la eliminación en base de datos debe ser prevenida
```
