// @ts-check
const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    ignores: [
      "projects/**/*",
      "coverage/**",
      "dist/**",
      "node_modules/**",
    ],
  },

  // TypeScript-Dateien
  ...compat
    .extends(
      "plugin:@angular-eslint/recommended",
      "plugin:@angular-eslint/template/process-inline-templates"
    )
    .map((config) => ({ ...config, files: ["**/*.ts"] })),
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, "tsconfig.eslint.json")],
      },
    },
    rules: {
      "@angular-eslint/template/prefer-control-flow": "off",
      "@angular-eslint/prefer-inject": "off",
    },
  },

  // Spec- und Vitest-Konfigurationsdateien (ohne Typprojekt)
  {
    files: ["**/*.spec.ts", "vitest.config.ts"],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },

  // HTML-Templates
  ...compat
    .extends("plugin:@angular-eslint/template/recommended")
    .map((config) => ({ ...config, files: ["**/*.html"] })),
  {
    files: ["**/*.html"],
    rules: {
      "@angular-eslint/template/prefer-control-flow": "off",
    },
  },
];
