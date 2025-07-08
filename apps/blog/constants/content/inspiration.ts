export const INSPIRATION_CONFIG = {
  CONTENT_PATH: "content/inspiration",
  FILE_EXTENSION: ".mdx",
  DEFAULT_SORT: "createdAt" as const,
  SUPPORTED_KEYWORDS: ["inspiration", "twitter", "social", "design", "frontend", "backend"] as const,
} as const;

export const INSPIRATION_STATUS = {
  READY: "ready",
  DRAFT: "draft",
} as const;

export type InspirationStatus = (typeof INSPIRATION_STATUS)[keyof typeof INSPIRATION_STATUS];
export type InspirationKeyword = (typeof INSPIRATION_CONFIG.SUPPORTED_KEYWORDS)[number];
