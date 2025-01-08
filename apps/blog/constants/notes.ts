import { Category, Notes } from "@/constants/notes.types";
import { getFolderNames } from "@/lib/file-system";
import { isCategory } from "@/lib/type-guards";
import path from "path";

export const CONTENT_PATH = path.join(process.cwd(), "content");

/** 카테고리 */
export const CATEGORIES: Category[] = await getFolderNames(CONTENT_PATH);

/** 서브 카테고리 */
export const getSubCategoriesByCategory = async (category: Category) => await getFolderNames(path.join(CONTENT_PATH, category));

/** 글 제목 */
export const getSlugsByCategoryAndSub = async (category: Category, sub: string) => await getFolderNames(path.join(CONTENT_PATH, category, sub));

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
