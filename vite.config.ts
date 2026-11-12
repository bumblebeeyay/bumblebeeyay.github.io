import { defineConfig } from "vitest/config";

export default defineConfig({
  // Relative base: works both on a user site (name.github.io) and a project site (name.github.io/repo).
  base: "./",
  test: {
    include: ["src/**/*.test.ts"],
    // A light DOM for view and controller tests; pure tests do not mind it.
    environment: "happy-dom",
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/test/**",
        // Composition root: only wiring, better checked end to end in a real browser.
        "src/main.ts",
      ],
      reporter: ["text", "html"],
      // A floor, not a goal: fails the check if coverage drops noticeably.
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
  },
});
