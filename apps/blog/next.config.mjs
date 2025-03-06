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
  experimental: {
    ppr: "incremental",
  },
};

/** @type {import('@next/mdx').WithMDX} */
const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
