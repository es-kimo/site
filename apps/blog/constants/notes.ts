import { Category, NoteMetadata, Notes } from "@/constants/notes.types";
import { getFolderNames } from "@/lib/file-system";
import { isCategory } from "@/lib/type-guards";
import path from "path";

export const CONTENT_PATH = path.join(process.cwd(), "content");

/** 카테고리 */
export const CATEGORIES: Category[] = await getFolderNames(CONTENT_PATH);

/** 글 제목 (draft 제외, 이미 디코딩된 params를 받음) */
export const getSlugsByCategory = async (category: Category) => {
  const slugs = await getFolderNames(path.join(CONTENT_PATH, category));

  // draft 상태인 글 필터링
  const publishedSlugs = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const metadata = await getSlugMetadata(category, slug);
        return metadata.other?.status !== "draft" ? slug : null;
      } catch (error) {
        // metadata를 가져올 수 없는 경우 제외
        console.error(`Failed to load metadata for ${category}/${slug}:`, error);
        return null;
      }
    })
  );

  return publishedSlugs.filter((slug): slug is string => slug !== null);
};

// TODO: metadata의 타입가드 및 불일치시 에러 던지기
/** 글 정보 (이미 디코딩된 params를 받음) */
export const getSlugMetadata = async (category: Category, slug: string): Promise<NoteMetadata> => {
  const { metadata } = await import(`@/content/${category}/${slug}/page.mdx`);
  return metadata;
};

// TODO: use Promise all to start concurrently
/** 노트 */
export const NOTES: Notes = await (async () => {
  const notes: Notes = {};
  for (const category of CATEGORIES) {
    notes[category] = isCategory(category) ? await getSlugsByCategory(category) : [];
  }

  return notes;
})();
