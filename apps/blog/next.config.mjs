import createMDX from "@next/mdx";
import { fileURLToPath } from "node:url";
import { editorOrigins } from "./lib/editor-origins.mjs";
import { rehypePlugins, remarkPlugins } from "./lib/mdx-plugins.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "ts", "tsx"],
  transpilePackages: ["@workspace/ui", "@workspace/resume"],
  async headers() {
    // 미리보기는 에디터 안에서만 띄운다
    return [{ source: "/preview", headers: [{ key: "Content-Security-Policy", value: `frame-ancestors ${editorOrigins.join(" ")}` }] }];
  },
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
/** @param {import('./lib/mdx-plugins.mjs').MdxPlugin} plugin */
const toLoaderPlugin = ({ name, options }) => {
  const resolved = name.startsWith("./") ? fileURLToPath(new URL(name, import.meta.url)) : name;
  return options ? [resolved, options] : [resolved];
};

/** @type {import('@next/mdx').WithMDX} */
const withMDX = createMDX({
  options: {
    remarkPlugins: remarkPlugins.map(toLoaderPlugin),
    rehypePlugins: rehypePlugins.map(toLoaderPlugin),
  },
});

export default withMDX(nextConfig);

