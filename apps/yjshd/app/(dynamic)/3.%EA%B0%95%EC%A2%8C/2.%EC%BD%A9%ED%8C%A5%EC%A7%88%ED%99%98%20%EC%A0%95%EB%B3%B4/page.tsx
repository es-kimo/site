import { getMdxContent } from "@/lib/content";
import { getPostMetadata } from "@/lib/metadata";
import { formatPostDate } from "@workspace/common/lib/date";
import { getSlugsByCategoryAndSubCategory } from "@workspace/common/structure/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "콩팥질환 정보",
  description:
    "콩팥(신장)질환에 대한 전문적이고 신뢰할 수 있는 의료 정보를 제공합니다. 만성 신부전, 급성 신부전, 사구체신염 등 다양한 콩팥질환에 대한 이해를 돕는 전문 의료 정보를 확인하실 수 있습니다.",
  keywords: ["콩팥질환", "신장질환", "만성신부전", "급성신부전", "사구체신염", "의료정보", "건강교육", "연세정성내과"],
  openGraph: {
    title: "연세정성내과 콩팥질환 정보",
    description:
      "콩팥(신장)질환에 대한 전문적이고 신뢰할 수 있는 의료 정보를 제공합니다. 만성 신부전, 급성 신부전, 사구체신염 등 다양한 콩팥질환에 대한 이해를 돕는 전문 의료 정보를 확인하실 수 있습니다.",
    type: "article",
    locale: "ko_KR",
    siteName: "연세정성내과",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "연세정성내과" }],
  creator: "연세정성내과",
  publisher: "연세정성내과",
  category: "의료정보",
  alternates: {
    canonical: `https://www.yonsei-jshd.com/${encodeURI("3.강좌")}/${encodeURI("2.콩팥질환 정보")}`,
  },
};

type Post = Awaited<ReturnType<typeof getPostMetadata>> &
  Awaited<ReturnType<typeof getMdxContent>> & {
    id: string;
    excerpt: string;
    slug: string;
  };

export default async function KidneyPostsSample() {
  const slugs = await getSlugsByCategoryAndSubCategory("3.강좌", "2.콩팥질환 정보");
  const posts: Post[] = await Promise.all(
    slugs.map(async (slug) => {
      const metadata = await getPostMetadata({ category: "3.강좌", subCategory: "2.콩팥질환 정보", slug });
      const content = await getMdxContent({ category: "3.강좌", subCategory: "2.콩팥질환 정보", slug });
      return { ...metadata, ...content, id: `${metadata.other.createdAt}-${slug}`, excerpt: content.content, slug };
    }),
  ).then((posts) => posts.sort((a, b) => new Date(b.other.createdAt).getTime() - new Date(a.other.createdAt).getTime()));
  const categorizedPosts = posts.reduce(
    (acc, post) => {
      if (!post.category) {
        return acc;
      }
      if (!acc[post.category]) {
        acc[post.category] = [];
      }
      acc[post.category]?.push(post);
      return acc;
    },
    {} as Record<string, typeof posts>,
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Tabs defaultValue="all" className="w-full md:w-auto">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          {Object.keys(categorizedPosts).map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">
          <AccordionPosts posts={posts} />
        </TabsContent>
        {Object.keys(categorizedPosts).map((category) => (
          <TabsContent key={category} value={category}>
            <AccordionPosts posts={categorizedPosts[category]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const AccordionPosts = ({ posts = [] }: { posts?: Post[] }) => {
  return (
    <Accordion type="multiple" className="space-y-4">
      {posts.map((post) => (
        <AccordionItem key={post.id} value={`${post.id}`}>
          <AccordionTrigger className="flex justify-end items-center">
            <div className="mr-auto">
              <span className="font-medium text-gray-800">{String(post.title)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <time className="text-sm text-gray-500">{formatPostDate(post.other.createdAt)}</time>
              <Badge variant="secondary">{post.category}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-2 text-gray-700 line-clamp-2">{post.excerpt}</p>
            <Button variant="link" asChild className="flex">
              <Link href={`/3.강좌/2.콩팥질환 정보/${post.slug}`}>더보기 →</Link>
            </Button>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
