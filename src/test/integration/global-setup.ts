import { spawn, type ChildProcess } from "child_process";

const DEFAULT_TEST_SERVER_URL = "http://127.0.0.1:3101";
const SERVER_READY_TIMEOUT_MS = 45_000;
const SERVER_POLL_INTERVAL_MS = 500;

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerReady(baseUrl: string) {
  try {
    const response = await fetch(`${baseUrl}/api/programs`, { method: "GET" });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(baseUrl: string) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < SERVER_READY_TIMEOUT_MS) {
    if (await isServerReady(baseUrl)) {
      return;
    }

    await wait(SERVER_POLL_INTERVAL_MS);
  }

  throw new Error(`Next.js test server did not become ready at ${baseUrl}`);
}

export async function setup() {
  const baseUrl = process.env.TEST_SERVER_URL || DEFAULT_TEST_SERVER_URL;
  process.env.TEST_SERVER_URL = baseUrl;
  process.env.BETTER_AUTH_URL = baseUrl;
  process.env.NEXT_PUBLIC_APP_URL = baseUrl;
  process.env.LAB08_INTEGRATION_TESTS = "true";

  if (await isServerReady(baseUrl)) {
    return;
  }

  const url = new URL(baseUrl);
  const server = spawn("pnpm", ["dev", "-H", url.hostname, "-p", url.port || "3101"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      BETTER_AUTH_URL: baseUrl,
      NEXT_PUBLIC_APP_URL: baseUrl,
      LAB08_INTEGRATION_TESTS: "true"
    },
    stdio: "pipe",
    shell: false
  });

  server.stdout?.on("data", (chunk) => {
    process.stdout.write(`[next-test-server] ${chunk}`);
  });

  server.stderr?.on("data", (chunk) => {
    process.stderr.write(`[next-test-server] ${chunk}`);
  });

  await waitForServer(baseUrl);

  return async () => {
    await stopServer(server);
  };
}

async function stopServer(server: ChildProcess) {
  if (server.killed || server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");

  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    wait(5_000).then(() => {
      if (!server.killed && server.exitCode === null) {
        server.kill("SIGKILL");
      }
    })
  ]);
}
