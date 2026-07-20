import { expect, test, type APIRequestContext } from "@playwright/test";

import {
  cleanupLab08Data,
  createAttributedTestExercise,
  createPublishedTestProgram,
  disconnectPrisma,
  shouldKeepIntegrationData
} from "../src/test/integration/helpers/workout-session-fixtures";

interface ProgramListItem {
  slug: string;
  title: string;
}

interface ProgramDetail {
  id: string;
  slug: string;
  slugEn: string;
  title: string;
  titleEn: string;
  coaches: Array<{ id: string }>;
  weeks: Array<{
    weekNumber: number;
    sessions: Array<{
      id: string;
      slug: string;
      slugEn: string;
      totalExercises: number;
    }>;
  }>;
}

async function findProgramWithSession(request: APIRequestContext, preferredRunId?: string) {
  const listResponse = await request.get("/api/programs");
  const programs = (await listResponse.json()) as ProgramListItem[];

  expect(listResponse.status()).toBe(200);
  expect(programs.length).toBeGreaterThan(0);

  const preferredPrograms = [
    ...programs.filter((program) => preferredRunId && program.slug.startsWith(preferredRunId)),
    ...programs.filter((program) => program.slug.startsWith("e2e-programs") && !program.slug.startsWith(preferredRunId || "")),
    ...programs.filter((program) => program.slug.startsWith("hito3-programs-deployed")),
    ...programs.filter((program) => !program.slug.startsWith("e2e-programs") && !program.slug.startsWith("hito3-programs-deployed"))
  ];

  for (const program of preferredPrograms) {
    const detailResponse = await request.get(`/api/programs/${program.slug}`);

    if (detailResponse.status() !== 200) {
      continue;
    }

    const detail = (await detailResponse.json()) as ProgramDetail;
    const session = detail.weeks[0]?.sessions[0];

    if (session) {
      return { detail, session };
    }
  }

  throw new Error("No public program with at least one session was found");
}

test.describe("HITO 3 E2E: Programs module", () => {
  let runId: string | undefined;

  test.beforeAll(async ({ browserName: _browserName }, testInfo) => {
    runId = `e2e-programs-${testInfo.project.name}-${testInfo.workerIndex}-${crypto.randomUUID()}`;

    await cleanupLab08Data(runId);

    const exercise = await createAttributedTestExercise(runId);

    await createPublishedTestProgram(runId, exercise.id);
  });

  test.afterAll(async () => {
    if (runId && !shouldKeepIntegrationData()) {
      await cleanupLab08Data(runId);
    }

    await disconnectPrisma();
  });

  test("renders the public programs catalog and opens a program detail page", async ({ page, request }) => {
    const { detail } = await findProgramWithSession(request, runId);
    const programSlug = detail.slugEn || detail.slug;
    const catalog = await page.goto("/en/programs", { waitUntil: "domcontentloaded" });

    expect(catalog?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toBeEmpty();

    const detailPage = await page.goto(`/en/programs/${programSlug}`, { waitUntil: "domcontentloaded" });

    expect(detailPage?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(detail.titleEn || detail.title);
  });

  test("validates nested program session API data", async ({ request }) => {
    const { detail, session } = await findProgramWithSession(request, runId);
    const apiProgramSlug = detail.slugEn || detail.slug;
    const apiSessionSlug = session.slugEn || session.slug;
    const sessionApi = await request.get(`/api/programs/${apiProgramSlug}/sessions/${apiSessionSlug}?locale=en`);
    const sessionBody = await sessionApi.json();

    expect(sessionApi.status()).toBe(200);
    expect(detail.coaches.length).toBeGreaterThan(0);
    expect(detail.weeks.length).toBeGreaterThan(0);
    expect(session.totalExercises).toBeGreaterThan(0);
    expect(sessionBody.session.exercises.length).toBeGreaterThan(0);
    expect(sessionBody.session.exercises[0].suggestedSets.length).toBeGreaterThan(0);
  });
});
