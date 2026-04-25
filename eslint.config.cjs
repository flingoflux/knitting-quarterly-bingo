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

  // Architektur-Regeln: Presentation-Referenzen
  {
    files: ["src/app/features/*/presentation/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "../../*/presentation/**",
                "../../../*/presentation/**",
                "../../../../*/presentation/**",
                "../../../../../*/presentation/**",
              ],
              message:
                "Keine Cross-Feature-Imports zwischen presentation-Ordnern. Gemeinsame Typen in shared ablegen.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/features/*/presentation/common/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../desktop/**", "../mobile/**", "../print/**"],
              message:
                "common-Komponenten duerfen keine view-spezifischen Komponenten (desktop/mobile/print) referenzieren.",
            },
            {
              group: [
                "**/shared/ui/desktop/**",
                "**/shared/ui/mobile/**",
                "**/shared/ui/print/**",
              ],
              message:
                "common-Komponenten duerfen keine view-spezifischen shared/ui Unterordner direkt referenzieren.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/features/*/presentation/desktop/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../mobile/**", "../print/**"],
              message:
                "desktop-Komponenten duerfen keine mobile/print Komponenten desselben Features referenzieren.",
            },
            {
              group: ["**/shared/ui/mobile/**", "**/shared/ui/print/**"],
              message:
                "desktop-Komponenten duerfen keine mobile/print shared/ui Unterordner direkt referenzieren.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/features/*/presentation/mobile/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../desktop/**", "../print/**"],
              message:
                "mobile-Komponenten duerfen keine desktop/print Komponenten desselben Features referenzieren.",
            },
            {
              group: ["**/shared/ui/desktop/**", "**/shared/ui/print/**"],
              message:
                "mobile-Komponenten duerfen keine desktop/print shared/ui Unterordner direkt referenzieren.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/features/*/presentation/print/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../desktop/**", "../mobile/**"],
              message:
                "print-Komponenten duerfen keine desktop/mobile Komponenten desselben Features referenzieren.",
            },
            {
              group: ["**/shared/ui/desktop/**", "**/shared/ui/mobile/**"],
              message:
                "print-Komponenten duerfen keine desktop/mobile shared/ui Unterordner direkt referenzieren.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/app/features/quarter-lifecycle/presentation/quarterly-view-page.component.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
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
