import { Category, NoteMetadata, Notes } from "@/constants/notes.types";
import { getFolderNames } from "@/lib/file-system";
import { isCategory } from "@/lib/type-guards";
import path from "path";

export const CONTENT_PATH = path.join(process.cwd(), "content");

/** 카테고리 */
export const CATEGORIES: Category[] = await getFolderNames(CONTENT_PATH);

// TODO: 비동기 효율 테스트
/** 서브 카테고리 (이미 디코딩된 category를 받음) */
export const getSubCategoriesByCategory = async (category: Category) => getFolderNames(path.join(CONTENT_PATH, category));

/** 글 제목 (draft 제외, 이미 디코딩된 params를 받음) */
export const getSlugsByCategoryAndSub = async (category: Category, sub: string) => {
  const slugs = await getFolderNames(path.join(CONTENT_PATH, category, sub));

  // draft 상태인 글 필터링
  const publishedSlugs = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const metadata = await getSlugMetadata(category, sub, slug);
        return metadata.other?.status !== "draft" ? slug : null;
      } catch (error) {
        // metadata를 가져올 수 없는 경우 제외
        console.error(`Failed to load metadata for ${category}/${sub}/${slug}:`, error);
        return null;
      }
    })
  );

  return publishedSlugs.filter((slug): slug is string => slug !== null);
};

// TODO: metadata의 타입가드 및 불일치시 에러 던지기
/** 글 정보 (이미 디코딩된 params를 받음) */
export const getSlugMetadata = async (category: Category, sub: string, slug: string): Promise<NoteMetadata> => {
  const { metadata } = await import(`@/content/${category}/${sub}/${slug}/page.mdx`);
  return metadata;
};

// TODO: use Promise all to start concurrently
/** 노트 */
export const NOTES: Notes = await (async () => {
  const notes: Notes = {};
  for (const category of CATEGORIES) {
    const tempCategory: Record<string, string[]> = {};
    const subs = isCategory(category) ? await getSubCategoriesByCategory(category) : [];
    for await (const sub of subs) {
      tempCategory[sub] = isCategory(category) ? await getSlugsByCategoryAndSub(category, sub) : [];
    }
    notes[category] = tempCategory;
  }

  return notes;
})();
