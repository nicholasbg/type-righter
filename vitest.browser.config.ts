import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/check-dom.test.ts"],
    passWithNoTests: false,
    browser: {
      enabled: true,
      provider: playwright({
        connectOptions: process.env.PLAYWRIGHT_ENDPOINT
          ? {
              wsEndpoint: process.env.PLAYWRIGHT_ENDPOINT,
              exposeNetwork: "<loopback>",
            }
          : undefined,
      }),
      headless: true,
      instances: [{ browser: "chromium" }],
      screenshotDirectory: ".vitest-attachments/__screenshots__",
    },
  },
});
