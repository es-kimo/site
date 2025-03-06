import { CategoryNavigationTab } from "@/components/navigation-tab";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="pt-6 px-8 space-y-10">
      <CategoryNavigationTab />
      {children}
    </main>
  );
}
