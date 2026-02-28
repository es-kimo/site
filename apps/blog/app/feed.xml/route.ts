import { getSlugMetadata, NOTES } from "@/constants/notes";

const BASE_URL = "https://khryu.dev";

export async function GET() {
  const posts = await Promise.all(
    Object.entries(NOTES).flatMap(([category, slugs]) =>
      slugs.map(async (slug) => {
        const metadata = await getSlugMetadata(category, slug);
        return {
          title: metadata.title?.toString() ?? "",
          description: metadata.description?.toString() ?? "",
          url: `${BASE_URL}/writing/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
          date: metadata.other?.updatedAt ?? metadata.other?.createdAt ?? "",
        };
      })
    )
  );

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kihyun Ryu</title>
    <link>${BASE_URL}</link>
    <description>웹 개발 분야의 다양한 주제를 글로 다룹니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `<item>
      <title><![CDATA[${post.title}]]></title>
      <link>${post.url}</link>
      <guid isPermaLink="true">${post.url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
      )
      .join("\n    ")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
