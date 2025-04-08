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
        <body className={`antialiased`}>
          <div className="max-w-blog mx-auto">{children}</div>
        </body>
      </html>
    </ViewTransitions>
  );
}
