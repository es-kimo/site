import { Geist, Geist_Mono } from "next/font/google";

import { TheHeader } from "@/components/TheHeader";
import "@workspace/ui/globals.css";
import { ViewTransitions } from "next-view-transitions";
import { CategoryParams } from "@workspace/common/structure/params.types";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<CategoryParams>;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
          <TheHeader params={params} />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
