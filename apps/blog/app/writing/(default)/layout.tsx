import { CategoryNavigationTab } from "@/components/navigation-tab";

export async function generateMetadata() {
  return {
    title: "Writing",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="space-y-6">
      <CategoryNavigationTab />
      {children}
    </main>
  );
}
