import { BaseMetadata } from "../../core/metadata";

export interface InspirationMetadata extends BaseMetadata {
  title: string;
  description: string;
  keywords: string[];
  alternate: {
    canonical: string;
  };
  other: {
    status: "ready" | "draft";
    createdAt: string;
    originalLink: string;
    author: string;
  };
}

export interface InspirationPost {
  slug: string;
  metadata: InspirationMetadata;
  filePath: string;
  fileName: string;
}
