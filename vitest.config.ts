import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/check.test.ts"],
    passWithNoTests: false,
  },
});
