import { defineConfig } from "vite";

export default defineConfig({
  // Relative base: works both on a user site (name.github.io) and a project site (name.github.io/repo).
  base: "./",
  test: {
    include: ["src/**/*.test.ts"],
  },
});
