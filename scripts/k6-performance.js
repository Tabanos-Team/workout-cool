import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

// ======================================================
// Workout Cool - Performance Testing
// ======================================================
//
// Proyecto:
// Workout Cool
//
// Objetivo:
//
// Evaluar el atributo de calidad "Rendimiento"
// mediante pruebas de sistema sobre la aplicación
// desplegada en:
//
// https://workout-cool-ten.vercel.app
//
// ======================================================


// ======================================================
// Variables de entorno
// ======================================================

const BASE_URL =
    __ENV.BASE_URL ??
    "https://workout-cool-ten.vercel.app/api";

const EMAIL =
    __ENV.EMAIL ??
    "verdoso64@gmail.com";

const PASSWORD =
    __ENV.PASSWORD ??
    "Workout2026!";


// ======================================================
// Configuración general
// ======================================================

export const options = {

    discardResponseBodies: false,

    scenarios: {

        //------------------------------------------------
        // Smoke Test
        //------------------------------------------------

        smoke: {

            executor: "constant-vus",

            vus: 1,

            duration: "30s"

        },

        //------------------------------------------------
        // Load Test
        //------------------------------------------------

        load: {

            executor: "constant-vus",

            vus: 20,

            duration: "2m",

            startTime: "35s"

        },

        //------------------------------------------------
        // Stress Test
        //------------------------------------------------

        stress: {

            executor: "constant-vus",

            vus: 50,

            duration: "3m",

            startTime: "2m40s"

        },

        //------------------------------------------------
        // Spike Test
        //------------------------------------------------

        spike: {

            executor: "constant-vus",

            vus: 100,

            duration: "30s",

            startTime: "5m50s"

        }

    },

    thresholds: {

        //------------------------------------------------

        http_req_failed: [

            "rate<0.01"

        ],

        //------------------------------------------------

        http_req_duration: [

            "p(95)<250",

            "p(99)<500"

        ],

        //------------------------------------------------

        checks: [

            "rate>0.99"

        ],

        //------------------------------------------------

        login_duration: [

            "p(95)<300"

        ],

        //------------------------------------------------

        profile_duration: [

            "p(95)<250"

        ],

        //------------------------------------------------

        preferences_duration: [

            "p(95)<250"

        ],

        //------------------------------------------------

        sync_duration: [

            "p(95)<300"

        ]

    }

};


// ======================================================
// Métricas personalizadas
// ======================================================

const loginDuration =
    new Trend("login_duration");

const profileDuration =
    new Trend("profile_duration");

const preferencesDuration =
    new Trend("preferences_duration");

const syncDuration =
    new Trend("sync_duration");

const loginErrors =
    new Rate("login_errors");

const profileErrors =
    new Rate("profile_errors");

const preferencesErrors =
    new Rate("preferences_errors");

const syncErrors =
    new Rate("sync_errors");

const successfulLogins =
    new Counter("successful_logins");

const successfulSyncs =
    new Counter("successful_syncs");


// ======================================================
// Funciones auxiliares
// ======================================================

function uniqueId(prefix) {

    return `${prefix}-${__VU}-${__ITER}-${Date.now()}`;

}


//--------------------------------------------------------

function jsonHeaders() {

    return {

        "Content-Type": "application/json",

        "Accept": "application/json"

    };

}


//--------------------------------------------------------

function parseJson(response) {

    try {

        return response.json();

    }

    catch {

        return null;

    }

}


//--------------------------------------------------------

function registerMetric(metric, response) {

    metric.add(response.timings.duration);

}


//--------------------------------------------------------

function logFailure(endpoint, response) {

    console.error(

        `${endpoint} -> ${response.status}`,

        response.body

    );

}


// ======================================================
// PARTE 2/4
// Login, manejo de cookies, Perfil y Preferencias
// ======================================================

// ------------------------------------------------------
// Construye el header "Cookie" a partir de las cookies
// de sesión de Better Auth devueltas por /sign-in
// ------------------------------------------------------

function buildCookieHeader(response) {

    const jar = response.cookies;

    const token =
        jar["__Secure-better-auth.session_token"];

    const data =
        jar["__Secure-better-auth.session_data"];

    if (!token || !data) {

        return null;

    }

    const tokenValue = token[0].value;
    const dataValue = data[0].value;

    return (
        `__Secure-better-auth.session_token=${tokenValue}; ` +
        `__Secure-better-auth.session_data=${dataValue}`
    );

}


//--------------------------------------------------------

function authHeaders(cookieHeader) {

    return Object.assign(

        jsonHeaders(),

        {

            "Cookie": cookieHeader

        }

    );

}


// ------------------------------------------------------
// Login
// (POST /api/auth/sign-in/email -> ruta real de Better Auth,
// confirmada en src/features/auth/signin/model/useSignIn.ts)
//
// El login solo se intenta una vez por VU (ver ensureSession),
// pero cuando falla con 429 hay que evitar que el VU vuelva a
// insistir en cada iteración siguiente -- eso es justamente lo
// que generaba la ráfaga sostenida de 429 durante toda la
// corrida anterior. Por eso se agrega:
//
//   1. Backoff exponencial con techo + jitter: cada fallo
//      aumenta el tiempo de espera antes de reintentar.
//   2. Un "cooldown" por VU: mientras no haya pasado ese tiempo,
//      ni siquiera se hace la petición HTTP, se corta antes.
//   3. Si el servidor manda el header Retry-After, se respeta
//      ese valor en vez del backoff calculado.
// ------------------------------------------------------

let vuLoginRetryCount = 0;
let vuNextLoginAttempt = 0; // timestamp (ms) del próximo intento permitido

function login() {

    if (Date.now() < vuNextLoginAttempt) {

        // Seguimos en cooldown por un 429 previo de este VU:
        // no disparamos la petición para no seguir golpeando
        // el rate limiter.

        return null;

    }

    const payload = JSON.stringify({

        email: EMAIL,

        password: PASSWORD

    });

    const res = http.post(

        `${BASE_URL}/auth/sign-in/email`,

        payload,

        {

            headers: jsonHeaders(),

            tags: { endpoint: "login" }

        }

    );

    registerMetric(loginDuration, res);

    const success = check(res, {

        "login: status 200": (r) => r.status === 200,

        "login: cookies presentes": (r) =>
            buildCookieHeader(r) !== null

    });

    loginErrors.add(!success);

    if (!success) {

        logFailure("LOGIN", res);

        vuLoginRetryCount += 1;

        const retryAfterHeader = res.headers["Retry-After"];

        const retryAfterSeconds = retryAfterHeader
            ? parseFloat(retryAfterHeader)
            : null;

        const backoffSeconds =
            retryAfterSeconds && !isNaN(retryAfterSeconds)
                ? retryAfterSeconds
                : Math.min(30, 2 ** vuLoginRetryCount) + Math.random() * 2;

        vuNextLoginAttempt = Date.now() + (backoffSeconds * 1000);

        return null;

    }

    vuLoginRetryCount = 0;

    successfulLogins.add(1);

    return buildCookieHeader(res);

}


// ------------------------------------------------------
// Perfil
// Ruta real: GET/PUT /api/user/profile
// Respuesta GET: { user: { id, email, firstName, lastName, name, image } }
// ------------------------------------------------------

function getProfile(cookieHeader) {

    const res = http.get(

        `${BASE_URL}/user/profile`,

        {

            headers: authHeaders(cookieHeader),

            tags: { endpoint: "profile" }

        }

    );

    registerMetric(profileDuration, res);

    const body = parseJson(res);

    const success = check(res, {

        "profile: status 200": (r) => r.status === 200,

        "profile: incluye user.id": () =>
            !!(body && body.user && body.user.id)

    });

    profileErrors.add(!success);

    if (!success) {

        logFailure("PROFILE", res);

        return null;

    }

    return body;

}


// ------------------------------------------------------
// Preferencias
// Ruta real: GET/PUT /api/user/preferences
// Esquema real (zod, app/api/user/preferences/route.ts):
//   goals: string[]
//   fitnessLevel: "beginner" | "intermediate" | "advanced" | null
//   equipment: string[]
//   muscles: string[]
//   duration: number | null
//   weeklyFrequency: number (1-7)
//   notificationDays?: number[]
//   notificationTime?: string
// ------------------------------------------------------

function getPreferences(cookieHeader) {

    const res = http.get(

        `${BASE_URL}/user/preferences`,

        {

            headers: authHeaders(cookieHeader),

            tags: { endpoint: "preferences_get" }

        }

    );

    registerMetric(preferencesDuration, res);

    const success = check(res, {

        "preferences (GET): status 200": (r) =>
            r.status === 200

    });

    preferencesErrors.add(!success);

    if (!success) {

        logFailure("PREFERENCES_GET", res);

        return null;

    }

    return parseJson(res);

}


//--------------------------------------------------------

function updatePreferences(cookieHeader) {

    const payload = JSON.stringify({

        goals: ["strength", "muscle_gain"],

        fitnessLevel: "intermediate",

        equipment: ["DUMBBELL", "BARBELL"],

        muscles: ["CHEST", "BACK"],

        duration: 45,

        weeklyFrequency: 4,

        notificationDays: [1, 3, 5],

        notificationTime: "18:00"

    });

    const res = http.put(

        `${BASE_URL}/user/preferences`,

        payload,

        {

            headers: authHeaders(cookieHeader),

            tags: { endpoint: "preferences_update" }

        }

    );

    registerMetric(preferencesDuration, res);

    const success = check(res, {

        "preferences (PUT): status 200": (r) =>
            r.status === 200

    });

    preferencesErrors.add(!success);

    if (!success) {

        logFailure("PREFERENCES_UPDATE", res);

    }

    return success;

}


// ======================================================
// PARTE 3/4
// Payload dinámico y sincronización de Workout Sessions
// ======================================================

// ------------------------------------------------------
// Trae un pool de ejercicios reales (IDs válidos en BD).
// Ruta pública: GET /api/exercises/all
// El endpoint de sync valida que cada exercise.id exista
// en la base de datos, así que no se pueden inventar IDs.
// ------------------------------------------------------

function fetchExercisePool() {

    const res = http.get(

        `${BASE_URL}/exercises/all?limit=50`,

        {

            headers: jsonHeaders(),

            tags: { endpoint: "exercises_pool" }

        }

    );

    const body = parseJson(res);

    if (res.status !== 200 || !body || !Array.isArray(body.data)) {

        console.error(

            "No se pudo obtener el pool de ejercicios, " +
            "el sync de Workout Sessions se omitirá"

        );

        return [];

    }

    return body.data.map((exercise) => exercise.id);

}


// ------------------------------------------------------
// Genera sets simulados para un ejercicio de la sesión
// ------------------------------------------------------

function buildSets(count) {

    const sets = [];

    for (let i = 0; i < count; i++) {

        sets.push({

            id: uniqueId("set"),

            setIndex: i,

            types: ["REPS", "WEIGHT"],

            valuesInt: [8 + (i % 5), 20 + (i * 2.5)],

            units: ["kg"],

            completed: true

        });

    }

    return sets;

}


// ------------------------------------------------------
// Construye el payload dinámico de una Workout Session,
// respetando el esquema real de
// sync-workout-sessions.action.ts (envuelto en "session").
// ------------------------------------------------------

function buildWorkoutSessionPayload(userId, exercisePool) {

    const exerciseCount = Math.min(

        3 + (__ITER % 3),

        exercisePool.length

    );

    // Selección simple sin repetidos a partir del pool real
    const chosenExercises = [];

    for (let i = 0; i < exerciseCount; i++) {

        const index = (__VU + __ITER + i) % exercisePool.length;

        chosenExercises.push(exercisePool[index]);

    }

    const startedAt = new Date(
        Date.now() - 45 * 60 * 1000
    ).toISOString();

    const endedAt = new Date().toISOString();

    return JSON.stringify({

        session: {

            id: uniqueId("session"),

            userId: userId,

            startedAt: startedAt,

            endedAt: endedAt,

            status: "completed",

            muscles: ["CHEST", "BACK"],

            exercises: chosenExercises.map((exerciseId, order) => ({

                id: exerciseId,

                order: order,

                sets: buildSets(3)

            }))

        }

    });

}


// ------------------------------------------------------
// Sincroniza (crea) una Workout Session
// ------------------------------------------------------

function syncWorkoutSessions(cookieHeader, userId, exercisePool) {

    if (!exercisePool || exercisePool.length === 0) {

        syncErrors.add(true);

        return false;

    }

    const payload = buildWorkoutSessionPayload(userId, exercisePool);

    const res = http.post(

        `${BASE_URL}/workout-sessions/sync`,

        payload,

        {

            headers: authHeaders(cookieHeader),

            tags: { endpoint: "sync" }

        }

    );

    registerMetric(syncDuration, res);

    const success = check(res, {

        "sync: status 200": (r) => r.status === 200,

        "sync: respuesta valida": (r) =>
            parseJson(r) !== null

    });

    syncErrors.add(!success);

    if (!success) {

        logFailure("SYNC", res);

        return false;

    }

    successfulSyncs.add(1);

    return true;

}


// ======================================================
// PARTE 4/4
// Función default, handleSummary, validaciones y reporte
// ======================================================

// ------------------------------------------------------
// setup() corre UNA sola vez antes de la prueba (no por VU).
// Aquí se hace el login y se obtiene el perfil también una
// sola vez, de modo que los VUs comparten la misma sesión
// en lugar de hacer cada uno su propio POST /sign-in.
// Esto elimina la ráfaga de hasta 150 peticiones simultáneas
// que disparaba el rate-limiter 429 en los escenarios
// stress y spike.
// ------------------------------------------------------

export function setup() {

    const exercisePool = fetchExercisePool();

    // Login único para todo el test
    const cookieHeader = login();

    if (!cookieHeader) {

        throw new Error(
            "setup(): el login falló -- el test se aborta para " +
            "evitar correr " + String(options.scenarios.spike.vus) +
            " VUs sin sesión válida."
        );

    }

    sleep(0.3);

    const profile = getProfile(cookieHeader);

    if (!profile || !profile.user) {

        throw new Error(
            "setup(): no se pudo obtener el perfil del usuario -- " +
            "el test se aborta."
        );

    }

    return {

        exercisePool,

        cookieHeader,

        userId: profile.user.id

    };

}


// ------------------------------------------------------
// Estado de sesión cacheado por VU. k6 ejecuta cada VU en
// su propio contexto de módulo, así que esta variable
// actúa como cache "por VU": el login solo se hace una vez
// por VU en lugar de en cada iteración, evitando gatillar
// el rate limiter de Better Auth (causa de los 429 vistos
// en la corrida anterior).
// ------------------------------------------------------

let vuSession = null;

function ensureSession() {

    if (vuSession) {

        return vuSession;

    }

    const cookieHeader = login();

    if (!cookieHeader) {

        return null;

    }

    sleep(0.3);

    const profile = getProfile(cookieHeader);

    if (!profile || !profile.user) {

        return null;

    }

    vuSession = {

        cookieHeader: cookieHeader,

        userId: profile.user.id

    };

    return vuSession;

}


//--------------------------------------------------------

export default function (data) {

    // El jitter de arranque ya no es necesario: el login ocurre
    // una sola vez en setup(), por lo que no hay ráfaga de
    // peticiones /sign-in cuando los VUs arrancan en paralelo.

    const cookieHeader = data.cookieHeader;
    const userId       = data.userId;

    if (!cookieHeader || !userId) {

        // Fallback defensivo: setup() debería haber abortado
        // antes de llegar aquí, pero se protege igualmente.
        sleep(1);

        return;

    }

    sleep(0.3);

    // ----------------------------------------------
    // 1. Perfil
    // ----------------------------------------------

    getProfile(cookieHeader);

    sleep(0.3);

    // ----------------------------------------------
    // 2. Preferencias (lectura + actualización)
    // ----------------------------------------------

    getPreferences(cookieHeader);

    updatePreferences(cookieHeader);

    sleep(0.3);

    // ----------------------------------------------
    // 3. Sincronización de Workout Sessions
    // ----------------------------------------------

    syncWorkoutSessions(

        cookieHeader,

        userId,

        data.exercisePool

    );

    sleep(1);

}


// ------------------------------------------------------
// Validaciones auxiliares sobre el resumen final
// ------------------------------------------------------

function metricPassesThreshold(metricData, thresholdKey) {

    if (!metricData || !metricData.thresholds) {

        return null;

    }

    const threshold = metricData.thresholds[thresholdKey];

    if (!threshold) {

        return null;

    }

    return threshold.ok;

}


//--------------------------------------------------------

function buildValidationReport(data) {

    const metrics = data.metrics;

    return {

        http_req_failed_ok: metricPassesThreshold(
            metrics.http_req_failed,
            "rate<0.01"
        ),

        http_req_duration_p95_ok: metricPassesThreshold(
            metrics.http_req_duration,
            "p(95)<250"
        ),

        http_req_duration_p99_ok: metricPassesThreshold(
            metrics.http_req_duration,
            "p(99)<500"
        ),

        checks_ok: metricPassesThreshold(
            metrics.checks,
            "rate>0.99"
        ),

        login_ok: metricPassesThreshold(
            metrics.login_duration,
            "p(95)<300"
        ),

        profile_ok: metricPassesThreshold(
            metrics.profile_duration,
            "p(95)<250"
        ),

        preferences_ok: metricPassesThreshold(
            metrics.preferences_duration,
            "p(95)<250"
        ),

        sync_ok: metricPassesThreshold(
            metrics.sync_duration,
            "p(95)<300"
        ),

        successful_logins:
            metrics.successful_logins
                ? metrics.successful_logins.values.count
                : 0,

        successful_syncs:
            metrics.successful_syncs
                ? metrics.successful_syncs.values.count
                : 0

    };

}


//--------------------------------------------------------

function buildTextSummary(data, validation) {

    const lines = [];

    lines.push("======================================================");
    lines.push(" Workout Cool - Reporte de Pruebas de Rendimiento");
    lines.push("======================================================");
    lines.push("");
    lines.push(`Logins exitosos:        ${validation.successful_logins}`);
    lines.push(`Sincronizaciones ok:     ${validation.successful_syncs}`);
    lines.push("");
    lines.push("Cumplimiento de thresholds:");
    lines.push(`  http_req_failed < 1%        : ${validation.http_req_failed_ok}`);
    lines.push(`  http_req_duration p95 < 250ms: ${validation.http_req_duration_p95_ok}`);
    lines.push(`  http_req_duration p99 < 500ms: ${validation.http_req_duration_p99_ok}`);
    lines.push(`  checks > 99%                 : ${validation.checks_ok}`);
    lines.push(`  login p95 < 300ms            : ${validation.login_ok}`);
    lines.push(`  profile p95 < 250ms          : ${validation.profile_ok}`);
    lines.push(`  preferences p95 < 250ms      : ${validation.preferences_ok}`);
    lines.push(`  sync p95 < 300ms             : ${validation.sync_ok}`);
    lines.push("");
    lines.push("======================================================");

    return lines.join("\n");

}


// ------------------------------------------------------
// Reporte final (consola + JSON + resumen de texto)
// ------------------------------------------------------

export function handleSummary(data) {

    const validation = buildValidationReport(data);

    const textReport = buildTextSummary(data, validation);

    return {

        "stdout": textReport,

        "summary.json": JSON.stringify(

            {

                validation: validation,

                metrics: data.metrics

            },

            null,

            2

        )

    };

}