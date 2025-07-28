import { config } from "@workspace/eslint-config/base";

export default [
  ...config,
  {
    files: ["**/__tests__/**/*", "**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/examples/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
