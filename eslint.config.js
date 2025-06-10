import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
  {
    ignores: ["dist/**"],
  },
];
