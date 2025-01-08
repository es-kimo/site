import { Params } from "@/constants/params.type";
import { ImageResponse } from "next/og";
import path from "path";

// Image metadata
export const alt = "썸네일";
export const size = {
  width: 1920,
  height: 1080,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Params }) {
  const { category, sub, slug } = await params;
  const { metadata } = await import(`@/content/${path.join(category, sub, slug)}/page.mdx`);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundImage: `url(http://localhost:3000/og-bg.png)`,
        }}
      >
        <div
          style={{
            marginLeft: 220,
            marginRight: 220,
            display: "flex",
            fontSize: 130,
            letterSpacing: "-0.05em",
            fontStyle: "normal",
            color: "white",
            lineHeight: "120px",
            whiteSpace: "pre-wrap",
            transform: "translateY(-50%)",
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
