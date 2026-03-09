import { Noto_Sans_KR } from "next/font/google";

import { DynamicIsland } from "@/components/DynamicIsland";
import { Providers } from "@/components/providers";
import "@workspace/ui/globals.css";
import { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL("https://khryu.dev"),
    title: {
      default: "Kihyun Ryu",
      template: "%s | Kihyun Ryu",
    },
    description: `웹 개발 분야의 다양한 주제를 글로 다룹니다.`,
    authors: [{ name: "Kihyun Ryu" }],
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "Kihyun Ryu",
      url: "https://khryu.dev",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@ryurlah",
    },
    verification: {
      other: {
        "naver-site-verification": "74db7e238d5a4ee7bb37c92d5824483a890c0d69",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="ko" suppressHydrationWarning>
        <body className={`${notoSansKR.variable} font-sans antialiased `}>
          <Providers>
            <div className="max-w-blog mx-auto py-20 px-4">{children}</div>
            <DynamicIsland />
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
