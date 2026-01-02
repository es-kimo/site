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
    title: "블로그",
    description: `웹 개발 분야의 다양한 주제를 글로 다룹니다.`,
    authors: [{ name: "Kihyun Ryu" }],
    // TODO: naver-site-verification
    // TODO: og image
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
            <div className="max-w-blog mx-auto py-16">{children}</div>
            <DynamicIsland language={language} />
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
