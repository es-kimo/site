export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: { _: string; $: { isPermaLink: string } };
  pubDate: string;
  author: string;
}

export interface RSSChannel {
  title: string;
  link: string;
  description: string;
  language: string;
  lastBuildDate: string;
  item: RSSItem[];
}

export interface RSSFeed {
  rss: {
    channel: RSSChannel[];
  };
}

export interface MDXMetadata {
  title: string;
  description: string;
  keywords: string[];
  alternate: {
    canonical: string;
  };
  other: {
    status: string;
    createdAt: string;
    originalLink?: string;
    author?: string;
  };
}

export interface ConvertOptions {
  outputDir: string;
  rsshubUrl: string;
  twitterUsername: string;
  includeRetweets?: boolean;
}
