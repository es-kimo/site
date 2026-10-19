import { SlugParams } from "@/constants/params.types";
import { decodeURIS } from "@workspace/common/lib/uri";
import { ImageResponse } from "next/og";
import path from "path";

export const alt = "썸네일";
export const size = {
  width: 1920,
  height: 1080,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<SlugParams> }) {
  const { category, slug } = await params;
  const [decodedCategory, decodedSlug] = decodeURIS(category, slug);
  const { metadata } = await import(`@/content/${path.join(decodedCategory, decodedSlug)}/page.mdx`);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}/og-bg.png)`,
        }}
      >
        <div
          style={{
            marginLeft: 220,
            marginRight: 220,
            marginTop: 120,
            display: "flex",
            fontSize: 105,
            letterSpacing: "-0.05em",
            fontStyle: "normal",
            color: "white",
            lineHeight: "140px",
            whiteSpace: "pre-wrap",
          }}
        >
          {metadata.title}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
