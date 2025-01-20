import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "ts", "tsx"],
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
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
