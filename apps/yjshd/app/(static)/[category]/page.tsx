import { TheHeader } from "@/components/TheHeader";
import { getMdxContent } from "@/lib/content";
import { removeNumbering } from "@workspace/common/lib/string-utils";
import { decodeURIS } from "@workspace/common/lib/uri";
import type { CategoryParams } from "@workspace/common/structure/params.types";
import { categories, slugsMap, subCategoriesMap } from "@workspace/common/structure/structure";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ExternalLink } from "lucide-react";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<CategoryParams> }) {
  const { category } = await params;
  const [decodedCategory] = decodeURIS(category);
  const title = `${removeNumbering(decodedCategory)}`;
  const description = `연세정성내과의 ${removeNumbering(decodedCategory)} 글 모음입니다.`;

  return {
    title,
    description,
    keywords: ["연세정성내과", decodedCategory.replace(/^\d+\./, "")],
    openGraph: { title, description, type: "article", locale: "ko_KR", siteName: "연세정성내과" },
    robots: { index: true, follow: true },
    authors: [{ name: "연세정성내과" }],
    creator: "연세정성내과",
    publisher: "연세정성내과",
    alternates: { canonical: `https://yonsei-jshd.com/${category}` },
  };
}

export default async function Page({ params }: { params: Promise<CategoryParams> }) {
  const { category } = await params;
  const [decodedCategory] = decodeURIS(category);
  const categorySet = new Set(categories);
  const subCategories = subCategoriesMap.get(decodedCategory) ?? [];
  const mdxContents = await Promise.all(
    subCategories.map(async (subCategory) => {
      const slugs = slugsMap.get(decodedCategory, subCategory);
      const hasSlug = slugs && slugs.length > 0;
      if (hasSlug) {
        return { subCategory, headings: null };
      }
      const { headings } = await getMdxContent({ category: decodedCategory, subCategory });
      return { subCategory, headings: headings.filter((heading) => heading.depth === 2) };
    })
  );

  if (!categorySet.has(decodedCategory)) {
    return notFound();
  }

  return (
    <>
      <TheHeader params={params} />
      <section className="px-6 py-8 mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{removeNumbering(decodedCategory)}</span> 글 모음
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mdxContents.map(({ headings }, idx) => {
            const tag = subCategories[idx] ?? "";
            const firstDepthHeadings = headings?.filter((heading) => heading.depth === 2);

            return (
              <Link href={`/${category}/${encodeURI(tag)}`} key={tag} className="block">
                <Card className="group relative h-64 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300 bg-white overflow-hidden flex flex-col">
                  <CardHeader className="flex-none">
                    <CardTitle className="text-xl font-medium text-gray-800 line-clamp-2">{removeNumbering(tag)}</CardTitle>
                    <div className="mt-2 h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {firstDepthHeadings?.map((heading, i) => (
                        <Badge key={i} variant="outline" className="text-gray-700">
                          {heading.value}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full py-2">
                      자세히 보기 <ExternalLink />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
