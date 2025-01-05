import { ImageResponse } from "next/og";

export function generateOGImageData({ title, alt }: { title: string; alt: string }) {
  return {
    Image: async () =>
      new ImageResponse(
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
              {title}
            </div>
          </div>
        ),
        {
          width: 1920,
          height: 1080,
        }
      ),
    alt,
    runtime: "edge",
    size: {
      width: 1920,
      height: 1080,
    },
    contentType: "image/png",
  };
}
