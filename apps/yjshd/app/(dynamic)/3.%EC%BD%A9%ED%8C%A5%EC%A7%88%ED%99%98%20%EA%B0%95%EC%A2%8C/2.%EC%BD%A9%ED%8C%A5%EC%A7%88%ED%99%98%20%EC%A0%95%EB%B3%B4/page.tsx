import { getMdxContent } from "@/lib/content";
import { getPostMetadata } from "@/lib/metadata";
import { formatPostDate } from "@workspace/common/lib/date";
import { getSlugsByCategoryAndSubCategory } from "@workspace/common/structure/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Link } from "next-view-transitions";

type Post = Awaited<ReturnType<typeof getPostMetadata>> &
  Awaited<ReturnType<typeof getMdxContent>> & {
    id: string;
    excerpt: string;
    slug: string;
  };

export default async function KidneyPostsSample() {
  const slugs = await getSlugsByCategoryAndSubCategory("3.콩팥질환 강좌", "2.콩팥질환 정보");
  const posts: Post[] = await Promise.all(
    slugs.map(async (slug) => {
      const metadata = await getPostMetadata({ category: "3.콩팥질환 강좌", subCategory: "2.콩팥질환 정보", slug });
      const content = await getMdxContent({ category: "3.콩팥질환 강좌", subCategory: "2.콩팥질환 정보", slug });
      return { ...metadata, ...content, id: `${metadata.other.createdAt}-${slug}`, excerpt: content.content, slug };
    })
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
    {} as Record<string, typeof posts>
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
              <Link href={`/3.콩팥질환 강좌/2.콩팥질환 정보/${post.slug}`}>더보기 →</Link>
            </Button>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
