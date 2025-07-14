import { format } from "date-fns";
import type { RSSItem, MDXMetadata } from "./types";

export function createSlug(title: string, pubDate: string): string {
  const date = new Date(pubDate);
  const dateStr = format(date, "yyyy-MM-dd");

  // 제목에서 안전한 슬러그 생성
  const titleSlug = title
    .replace(/^RT\s+/, "") // RT 제거
    .replace(/[^\w\s가-힣]/g, "") // 특수문자 제거 (한글 유지)
    .trim()
    .substring(0, 50) // 길이 제한
    .replace(/\s+/g, "-") // 공백을 대시로
    .toLowerCase();

  return `${dateStr}-${titleSlug}`;
}

function parseVideoTag(videoTag: string): string {
  // 비디오 태그에서 src와 poster 추출
  const srcMatch = videoTag.match(/src=["']([^"']+)["']/);
  const posterMatch = videoTag.match(/poster=["']([^"']+)["']/);
  const widthMatch = videoTag.match(/width=["']([^"']+)["']/);
  const heightMatch = videoTag.match(/height=["']([^"']+)["']/);

  if (!srcMatch || !posterMatch) {
    return "[Video content]";
  }

  const videoUrl = srcMatch[1];
  const thumbnailUrl = posterMatch[1];
  const width = widthMatch ? widthMatch[1] : "auto";
  const height = heightMatch ? heightMatch[1] : "auto";

  // 마크다운 형태로 변환 (HTML 태그 제거 이후에도 안전)
  return `

[![Video thumbnail](${thumbnailUrl})](${videoUrl})

**📹 [View Video](${videoUrl})**${width !== "auto" && height !== "auto" ? ` • ${width}×${height}` : ""}

`;
}

export function cleanDescription(description: string): string {
  // HTML 태그 제거 및 텍스트 정리
  return description
    .replace(/<br\s*\/?>/gi, "\n") // <br> 태그를 줄바꿈으로
    .replace(/<video[^>]*>.*?<\/video>/gis, (match) => parseVideoTag(match)) // 비디오 태그 파싱
    .replace(/<img[^>]*>/gi, "[Image]") // 이미지 태그 제거
    .replace(/<[^>]*>/g, "") // 나머지 HTML 태그 제거
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim();
}

export function generateMDXMetadata(item: RSSItem, slug: string): MDXMetadata {
  const cleanTitle = item.title.replace(/^RT\s+/, "").substring(0, 100);
  const cleanDesc = cleanDescription(item.description).substring(0, 200);

  return {
    title: cleanTitle,
    description: cleanDesc,
    keywords: ["inspiration", "twitter", "social"],
    alternate: {
      canonical: `inspiration/${slug}`,
    },
    other: {
      status: "ready",
      createdAt: new Date(item.pubDate).toISOString(),
      originalLink: item.link,
      author: item.author,
    },
  };
}

export function generateMDXContent(item: RSSItem, metadata: MDXMetadata): string {
  const cleanContent = cleanDescription(item.description);

  return `export const metadata = ${JSON.stringify(metadata, null, 2)};

# ${metadata.title}

<PostDate>${metadata.other.createdAt}</PostDate>

${cleanContent}

---

<div className="mt-4 text-sm text-gray-500">
  **Author:** ${item.author}  
  **Original:** [View on Twitter](${item.link})  
  **Published:** ${format(new Date(item.pubDate), "PPpp")}
</div>
`;
}
