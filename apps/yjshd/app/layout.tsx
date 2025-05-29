import Footer from "@/components/TheFooter";
import "@workspace/ui/globals.css";
import { ViewTransitions } from "next-view-transitions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | 연세정성내과의원",
    default: "연세정성내과의원",
  },
  description: "더 나은 의료 서비스를 향한 도약, 연세정성내과의 발돋움 2025",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "연세정성내과의원",
    description: "더 나은 의료 서비스를 향한 도약, 연세정성내과의 발돋움 2025",
    siteName: "연세정성내과의원",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={`antialiased flex flex-col gap-8 justify-between min-h-dvh`}>
          <div className="w-full max-w-yjshd mx-auto">{children}</div>
          <Footer />
        </body>
      </html>
    </ViewTransitions>
  );
}
