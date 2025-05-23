import Footer from "@/components/TheFooter";
import "@workspace/ui/globals.css";
import { ViewTransitions } from "next-view-transitions";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={`antialiased flex flex-col min-h-screen`}>
          <div className="w-full max-w-yjshd mx-auto flex-1">{children}</div>
          <Footer />
        </body>
      </html>
    </ViewTransitions>
  );
}
