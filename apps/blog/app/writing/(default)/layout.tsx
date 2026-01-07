import { CategoryNavigationTab } from "@/components/navigation-tab";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="space-y-6 px-4">
      <CategoryNavigationTab />
      {children}
    </main>
  );
}
