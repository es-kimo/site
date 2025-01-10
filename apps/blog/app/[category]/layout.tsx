import NavigationTab from "@/components/navigation-tab";
import { NoteCard } from "@/components/note-card";
import { getSlugsByCategoryAndSub, getSubCategoriesByCategory } from "@/constants/notes";
import { categoryParams } from "@/constants/params";
import { CategoryParams } from "@/constants/params.types";
import { isCategory } from "@/lib/type-guards";
import { t } from "@/locales/translate";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return categoryParams;
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<CategoryParams>;
}>) {
  const { category, sub } = await params;
  const subs = sub ? [sub] : [...(await getSubCategoriesByCategory(category))];
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
              {subs.map(async (sub) => (await getSlugsByCategoryAndSub(category, sub)).map((slug) => <li key={slug}>{<NoteCard category={category} sub={sub} slug={slug} />}</li>))}
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
