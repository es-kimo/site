import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/anniversary/", "/database/", "/vault/"],
    },
    sitemap: "https://khryu.dev/sitemap.xml",
  };
}
