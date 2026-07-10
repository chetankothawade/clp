import js from "@eslint/js";
import globals from "globals";
import n from "eslint-plugin-n";
import security from "eslint-plugin-security";

const commonFiles = ["**/*.js"];

export default [
  {
    ignores: [
      "node_modules/**",
      "uploads/**",
      "coverage/**",
      "dist/**",
      "build/**",
      "postman_collection.json",
    ],
  },
  {
    files: commonFiles,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      n,
      security,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...n.configs["flat/recommended-module"].rules,
      ...security.configs.recommended.rules,
      "no-console": "off",
      "no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      "n/no-process-exit": "off",
      "n/no-missing-import": "off",
      "security/detect-object-injection": "off",
    },
  },
  {
    files: ["eslint.config.js"],
    rules: {
      "n/no-unpublished-import": "off",
    },
  },
  {
    files: ["src/migrations/**/*.js", "src/seeders/**/*.js"],
    rules: {
      "no-unused-vars": "off",
    },
  },
];
