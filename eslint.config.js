import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/.vitepress/cache/**",
      "**/.vitepress/dist/**",
      "apps/docs/generated/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
      ".agents/**",
      ".cursor/**",
      ".github/skills/**",
      ".github/prompts/**",
      "apps/api/drizzle/meta/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node,
      sourceType: "module",
    },
  },
);
