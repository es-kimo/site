import { getFolderNames } from "@workspace/common/lib/file-system";
import path from "path";

export const ENTRY_POINT = "content";

export const CONTENT_PATH = path.join(process.cwd(), ENTRY_POINT);

/** 카테고리 */
export const getCategories = async () => getFolderNames(CONTENT_PATH);

/** 서브 카테고리 */
export const getSubCategoriesByCategory = async (category: string) => getFolderNames(path.join(CONTENT_PATH, category));

/** 글 제목 */
export const getSlugsByCategoryAndSubCategory = async (category: string, subCategory: string) =>
  (await getFolderNames(path.join(CONTENT_PATH, category, subCategory))).filter((slug) => slug !== "img");

export const getSlugsByCategory = async (category: string) => getFolderNames(path.join(CONTENT_PATH, category));
