import createMDX from "@next/mdx";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "ts", "tsx"],
  transpilePackages: ["@workspace/ui", "@workspace/resume"],
  images: {
    remotePatterns: [
      process.env.NODE_ENV === "development"
        ? {
            protocol: "http",
            hostname: "localhost",
            port: "3000",
            pathname: "*/**",
          }
        : {
            protocol: "https",
            hostname: process.env.HOST_NAME,
            port: "",
            pathname: "*/**",
          },
    ],
  },
};

// @next/mdx는 플러그인을 문자열로만 받는다(Turbopack 직렬화). 상대 경로는 로더 기준으로 풀리므로 절대 경로를 넘긴다.
const remarkToc = fileURLToPath(new URL("./lib/remark-toc.mjs", import.meta.url));

/** @type {import('rehype-pretty-code').Options} */
const options = {
  theme: {
    dark: "monokai",
    light: "github-light-high-contrast",
  },
  keepBackground: false,
};

/** @type {import('@next/mdx').WithMDX} */
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm"], ["remark-math"], [remarkToc]],
    // rehype-slug는 rehype-katex보다 먼저 돌아야 수식 heading의 id가 깨지지 않는다
    rehypePlugins: [["rehype-slug"], ["rehype-katex"], ["rehype-pretty-code", options]],
  },
});

export default withMDX(nextConfig);

