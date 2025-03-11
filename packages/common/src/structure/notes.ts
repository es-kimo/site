import { Category, NoteMetadata, Notes } from "@workspace/common/structure/notes.types";
import { getFolderNames } from "@workspace/common/lib/file-system";
import { isCategory } from "@workspace/common/lib/type-guards";
import path from "path";

export const CONTENT_PATH = path.join(process.cwd(), "content");

/** 카테고리 */
export const CATEGORIES: Category[] = await getFolderNames(CONTENT_PATH);
export const getCategories = async () => await getFolderNames(CONTENT_PATH);

// TODO: 비동기 효율 테스트
/** 서브 카테고리 */
export const getSubCategoriesByCategory = async (category: Category) => getFolderNames(path.join(CONTENT_PATH, category));

/** 글 제목 */
export const getSlugsByCategoryAndSub = async (category: Category, sub: string) => getFolderNames(path.join(CONTENT_PATH, category, sub));

/**
 * 글 정보
 *
 * `common` 패키지에서 기존 함수를 생성하면, import 경로를 `common` 패키지 기준으로 잡게되어 cannot find module 에러가 발생합니다.
 *
 * 함수 생성 대신 사용하는 컴포넌트에서 아래와 같이 불러 사용하도록 합니다.
 *
 * const { metadata } = await import(`@/content/${category}/${sub}/${slug}/page.mdx`);
 */

// TODO: use Promise all to start concurrently
/** 노트 */
export const NOTES: Notes = await (async () => {
  console.log("NOTES CALLED");
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
