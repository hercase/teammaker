import { defineConfig } from "@playwright/test";

/*
  Runs against the dev server on :3000, starting one only if none is listening — during a session
  the dev server is already up, and `next build` must never run beside it (see CLAUDE.md), so the
  suite never builds.

  One project, Chromium at 390px, and no `hasTouch`: the share test relies on the desktop path,
  which writes the PNG to the clipboard where a test can read it.
*/
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 390, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  },
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
