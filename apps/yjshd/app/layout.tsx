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
        <body className={`antialiased flex flex-col`}>
          <div className="w-full max-w-yjshd mx-auto">{children}</div>
        </body>
      </html>
    </ViewTransitions>
  );
}
