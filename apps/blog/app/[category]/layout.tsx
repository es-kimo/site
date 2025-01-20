import NavigationTab from "@/components/navigation-tab";
import { NoteCard } from "@/components/note-card";
import { getSlugsByCategoryAndSub, getSubCategoriesByCategory } from "@/constants/notes";
import { categoryParams } from "@/constants/params";
import { CategoryParams } from "@/constants/params.types";
import { isCategory } from "@/lib/type-guards";
import { t } from "@/locales/translate";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { AlertCircle } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return categoryParams;
}

export async function generateMetadata({ params }: { params: Promise<CategoryParams> }): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${t(category)}`,
    description: `${t(category)} 분야의 다양한 주제를 글로 다룹니다.`,
    // TODO: og image
  };
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<CategoryParams>;
}>) {
  const { category, sub } = await params;
  const subs = sub ? [sub] : await getSubCategoriesByCategory(category);
  return (
    <main className="pt-6 pb-[10vh] px-8 sm:pt-[80px] sm:pb-[20vh] space-y-10">
      {isCategory(category) ? (
        <>
          <h2 className="font-bold text-3xl">{t(category)}</h2>
          <NavigationTab category={category} />
          <article>
            <h3 className="sr-only">아티클</h3>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* TODO: sort by created date */}
              {subs.map(async (sub) =>
                (await getSlugsByCategoryAndSub(category, sub)).map((slug) => (
                  <li key={slug} className="w-full">
                    <NoteCard category={category} sub={sub} slug={slug}>
                      <NoteCard.OpengraphImage category={category} sub={sub} slug={slug} />
                    </NoteCard>
                  </li>
                ))
              )}
              {!subs.length && (
                <li>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>아직 등록한 글이 없어요.</AlertTitle>
                    <AlertDescription>곧 새로운 글이 업데이트 될 예정이에요.</AlertDescription>
                  </Alert>
                </li>
              )}
            </ul>
          </article>

          {children}
        </>
      ) : (
        notFound()
      )}
    </main>
  );
}
