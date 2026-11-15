import { defineConfig, devices } from "@playwright/test";

/**
 * Visual regression: screenshots of built Storybook stories, compared against
 * committed baselines. Baselines are platform-specific (font rendering), so CI
 * runs in the official Playwright container and baselines are (re)generated
 * there via the "Update visual baselines" workflow.
 */
export default defineConfig({
  testDir: "./visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}-{projectName}{ext}",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  use: { baseURL: "http://127.0.0.1:6007", trace: "off" },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 800, height: 600 } },
    },
  ],
  webServer: {
    command: "http-server storybook-static -p 6007 -s",
    url: "http://127.0.0.1:6007",
    reuseExistingServer: !process.env.CI,
  },
});
