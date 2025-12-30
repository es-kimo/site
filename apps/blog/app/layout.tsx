import { Geist, Geist_Mono } from "next/font/google";

import { Island } from "@/components/Island";
import { Providers } from "@/components/providers";
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "블로그",
    description: `웹 개발 분야의 다양한 주제를 글로 다룹니다.`,
    authors: [{ name: "Kihyun Ryu" }],
    // TODO: naver-site-verification
    // TODO: og image
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="ko" suppressHydrationWarning>
        <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
          <Providers>
            <div className="max-w-blog mx-auto">{children}</div>
            <Island />
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
