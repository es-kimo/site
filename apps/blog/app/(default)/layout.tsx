import { CategoryNavigationTab } from "@/components/navigation-tab";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="pt-6 px-8 space-y-10">
      <Skeleton className="w-full h-[80px] md:h-[130px] rounded-xl md:rounded-2xl"></Skeleton>
      <CategoryNavigationTab />
      {children}
    </main>
  );
}
