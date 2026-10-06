import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  use: { baseURL: "http://localhost:3100", trace: "on-first-retry" },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Optional: run against an already-installed Chromium (e.g. in CI sandboxes).
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
      },
    },
  ],
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 240_000,
    // Keep E2E deterministic and prevent test runs from ever sending local credentials upstream.
    env: { NEWS_API_KEY: "", TMDB_API_KEY: "", USE_SAMPLE_DATA: "true" },
  },
});
