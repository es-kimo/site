import { CategoryNavigationTab } from "@/components/navigation-tab";

export async function generateMetadata() {
  return {
    title: "Writing",
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Writing</h1>
        <div className="mt-2">
          <CategoryNavigationTab />
        </div>
      </header>
      <div className="mt-8 pt-8">{children}</div>
    </main>
  );
}
