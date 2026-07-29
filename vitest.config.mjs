import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    setupFiles: ["tests/setup.js"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "json-summary", "html"],
      include: ["pages/api/**/*.js", "lib/server/**/*.js"],
      thresholds: {
        statements: 15,
        branches: 8,
        functions: 20,
        lines: 17,
      },
    },
  },
});
