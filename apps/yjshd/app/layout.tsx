import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { TheHeader } from "@/components/TheHeader";
import "@workspace/ui/globals.css";
import { ViewTransitions } from "next-view-transitions";

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
          <Providers>
            <TheHeader />
            {children}
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
