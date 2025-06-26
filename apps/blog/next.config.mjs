import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "ts", "tsx"],
  transpilePackages: ["@workspace/ui"],
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

/** @type {import('rehype-pretty-code').Options} */
const options = {
  theme: {
    dark: "github-dark-high-contrast",
    light: "github-light-high-contrast",
  },
  keepBackground: false,
};

/** @type {import('@next/mdx').WithMDX} */
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm"]],
    rehypePlugins: [["rehype-pretty-code", options]],
  },
});

export default withMDX(nextConfig);
