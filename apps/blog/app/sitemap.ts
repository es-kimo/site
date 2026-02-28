import { CATEGORIES, getSlugMetadata, NOTES } from "@/constants/notes";
import { MetadataRoute } from "next";

const BASE_URL = "https://khryu.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/writing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${BASE_URL}/writing/${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const postPages: MetadataRoute.Sitemap = await Promise.all(
    Object.entries(NOTES).flatMap(([category, slugs]) =>
      slugs.map(async (slug) => {
        const metadata = await getSlugMetadata(category, slug);
        const lastModified = metadata.other?.updatedAt ?? metadata.other?.createdAt;

        return {
          url: `${BASE_URL}/writing/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        };
      })
    )
  );

  return [...staticPages, ...categoryPages, ...postPages];
}
