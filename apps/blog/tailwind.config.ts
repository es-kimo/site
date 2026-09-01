import sharedConfig from "@workspace/ui/tailwind.config";
import type { Config } from "tailwindcss";

/** yjshd는 Noto Sans KR을 쓰므로 폰트는 공유 설정이 아니라 블로그에서만 덮어쓴다. */
const config = {
  presets: [sharedConfig],
  content: sharedConfig.content,
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          "sans-serif",
        ],
      },
    },
  },
} satisfies Config;

export default config;
