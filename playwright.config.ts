import { defineConfig } from "@playwright/test";

/*
  A port of this app's own, not 3000.

  `reuseExistingServer` is what makes the suite fast during a session — the dev server is already
  up, and `next build` must never run beside it (see CLAUDE.md), so the suite never builds. On
  3000 that same flag is a trap: any other Next project left running answers, Playwright reuses
  it, and the whole suite measures somebody else's app. It happened — the contrast and layout
  numbers came back off a completely different site, and nothing in the output said so, because a
  200 is a 200. 3200 is this app's, and `yarn dev` opens on it too, so the browser tab and the
  suite are the same address. `PORT` still overrides it here.

  One project, Chromium at 390px, and no `hasTouch`: the share test relies on the desktop path,
  which writes the PNG to the clipboard where a test can read it.
*/
const PORT = Number(process.env.PORT ?? 3200);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    viewport: { width: 390, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  },
  webServer: {
    command: `yarn next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
