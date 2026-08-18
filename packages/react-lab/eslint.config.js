import { config } from "@workspace/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // scripts/는 브라우저가 아니라 node에서 돈다.
    // 공유 설정(react-internal)은 브라우저 전역만 열어주므로 여기서 보태준다.
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: { process: "readonly" } },
  },
];
