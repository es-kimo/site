import { Geist, Geist_Mono } from "next/font/google";

import "@workspace/ui/globals.css";
import { ViewTransitions } from "next-view-transitions";
import { Metadata } from "next";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
          <div className="max-w-blog mx-auto">{children}</div>
        </body>
      </html>
    </ViewTransitions>
  );
}
