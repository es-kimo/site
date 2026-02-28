import { Geist, Geist_Mono, Noto_Sans_KR, STIX_Two_Text } from "next/font/google";

import { DynamicIsland } from "@/components/DynamicIsland";
import { Providers } from "@/components/providers";
import { getLanguage } from "@/lib/language";
import "@workspace/ui/globals.css";
import { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const stixTwoText = STIX_Two_Text({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-stix",
  display: "swap",
});

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
        "naver-site-verification": "74db7e238d5a4ee7bb37c92d5824483a890c0d69", // TODO: Naver Search Advisor 인증 후 코드 입력
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getLanguage();

  return (
    <ViewTransitions>
      <html lang={language} suppressHydrationWarning>
        <body className={`${fontSans.variable} ${fontMono.variable} ${stixTwoText.variable} ${notoSansKR.variable} font-sans antialiased `}>
          <Providers>
            <div className="max-w-blog mx-auto py-20 px-4">{children}</div>
            <DynamicIsland language={language} />
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
