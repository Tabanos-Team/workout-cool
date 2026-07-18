import { describe, expect, it, afterAll, beforeAll } from "vitest";
import {
  cleanupLab08Data,
  createAuthenticatedUser,
  createRunId,
  createTestExercise,
  createWorkoutSessionPayload,
  disconnectPrisma,
  type TestExercise,
  type TestIdentity
} from "./helpers/workout-session-fixtures";
import { apiRequest } from "./helpers/http";

describe("Pruebas extendidas de Workout Sessions y Estadisticas", () => {
  const runId = createRunId();
  let identity: TestIdentity;
  let exercise: TestExercise;
  let sessionPayload: any;

  beforeAll(async () => {
    await cleanupLab08Data(runId);
    identity = await createAuthenticatedUser(runId);
    exercise = await createTestExercise(runId);
    sessionPayload = createWorkoutSessionPayload(runId, identity.userId, exercise.id);
  });

  afterAll(async () => {
    await cleanupLab08Data(runId);
    await disconnectPrisma();
  });

  it("debe registrar feedback con datos validos e invalidos", async () => {
    // Crear una sesion de entrenamiento de prueba primero
    await apiRequest("/api/workout-sessions/sync", {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: sessionPayload
    });

    // Caso 1: Enviar feedback correcto (emoji feliz + texto)
    const resValido = await apiRequest<any>(`/api/workout-sessions/${sessionPayload.session.id}/feedback`, {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: {
        feedbackEmoji: "😃",
        feedbackText: "Buen entrenamiento"
      }
    });
    expect(resValido.response.status).toBe(200);
    expect(resValido.body.success).toBe(true);

    // Caso 2: Enviar feedback incorrecto (emoji que no existe en el sistema)
    const resInvalido = await apiRequest<any>(`/api/workout-sessions/${sessionPayload.session.id}/feedback`, {
      method: "POST",
      cookieHeader: identity.cookieHeader,
      body: {
        feedbackEmoji: "invalido"
      }
    });
    expect(resInvalido.response.status).toBe(400);
    expect(resInvalido.body.error).toBe("INVALID_INPUT");
  });

  it("debe validar que las estadisticas requieran permisos Premium", async () => {
    // Caso 1: Si el usuario no es premium, debe dar error 403
    const resNoPremium = await apiRequest<any>(`/api/exercises/${exercise.id}/statistics`, {
      cookieHeader: identity.cookieHeader
    });
    expect(resNoPremium.response.status).toBe(403);
    expect(resNoPremium.body.error).toBe("PREMIUM_REQUIRED");

    // Hacemos al usuario premium directamente en la base de datos de pruebas
    const { prisma } = await import("@/shared/lib/prisma");
    await prisma.user.update({
      where: { id: identity.userId },
      data: { isPremium: true }
    });

    // Caso 2: Si el usuario ya es premium, debe retornar las estadisticas (200)
    const resPremium = await apiRequest<any>(`/api/exercises/${exercise.id}/statistics`, {
      cookieHeader: identity.cookieHeader
    });
    expect(resPremium.response.status).toBe(200);
    expect(resPremium.body.exerciseId).toBe(exercise.id);
  });

  it("debe eliminar el entrenamiento y validar la eliminacion real", async () => {
    // Eliminar la sesion actual
    const resDelete = await apiRequest<any>(`/api/workout-sessions/${sessionPayload.session.id}`, {
      method: "DELETE",
      cookieHeader: identity.cookieHeader
    });
    expect(resDelete.response.status).toBe(200);
    expect(resDelete.body.success).toBe(true);

    // Comprobamos que de verdad se borro (no debe aparecer en su lista)
    const resList = await apiRequest<any[]>(`/api/workout-sessions/user/${identity.userId}`, {
      cookieHeader: identity.cookieHeader
    });
    const existe = resList.body.find((session) => session.id === sessionPayload.session.id);
    expect(existe).toBeUndefined();
  });
});
