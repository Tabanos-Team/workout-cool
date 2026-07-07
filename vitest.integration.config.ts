import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

import { defineConfig } from "vitest/config";

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename);
const env = loadDotEnv(path.resolve(__dirname, ".env"));

function loadDotEnv(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs.readFileSync(filePath, "utf8").split("\n").reduce<Record<string, string>>((acc, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return acc;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return acc;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (key) {
      acc[key] = value;
    }

    return acc;
  }, {});
}

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/test/integration/**/*.integration.test.ts"],
    globalSetup: ["./src/test/integration/global-setup.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    env: {
      ...env,
      NODE_ENV: "test",
      BETTER_AUTH_URL: env.BETTER_AUTH_URL || "http://127.0.0.1:3101",
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3101"
    }
  },

  resolve: {
    alias: [
      { find: "@public", replacement: path.resolve(__dirname, "./public") },
      { find: /^@\/locales\/(.*)/, replacement: path.resolve(__dirname, "./locales/$1") },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, "./src/$1") },
      { find: "locales", replacement: path.resolve(__dirname, "./locales") },
      { find: "@emails", replacement: path.resolve(__dirname, "./emails") }
    ]
  }
});
