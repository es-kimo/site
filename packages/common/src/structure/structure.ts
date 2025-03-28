import { extend2DMap } from "@workspace/common/lib/2d-map";
import { getCategories, getSlugsByCategoryAndSubCategory, getSubCategoriesByCategory } from "@workspace/common/structure/utils.js";

export const categories: readonly string[] = await getCategories();

export const subCategories2DArray: readonly string[][] = await Promise.all(categories.map((category) => getSubCategoriesByCategory(category)));

/**
 * `categories`, `subCategories2DArray`, `slugs3DArray`는 모두 `categories.map()`을 기반으로 순수하게 만들어진 배열입니다.
 *
 * 세 배열은 index가 완벽히 매칭되는 구조이며 같은 인덱스로 접근했을 때 항상 어떠한 값을 리턴합니다.
 *
 * Object.freeze()는 사용하지 않고, readonly 타입 제한만 걸어두었습니다.
 *
 * 이러한 조건 아래 제한적으로 `!` 타입 단언을 사용하기로 하였습니다.
 */
export const slugs3DArray: readonly string[][][] = await Promise.all(
  categories.map(async (category, i) => {
    const subCategories = subCategories2DArray[i]!;
    return await Promise.all(subCategories.map((sub) => getSlugsByCategoryAndSubCategory(category, sub)));
  })
);

export const subCategoriesMap = new Map<string, string[]>(subCategories2DArray.map((subCategories, i) => [categories[i]!, subCategories]));

export const slugsMap = extend2DMap(
  new Map<string, Map<string, string[]>>(
    slugs3DArray.map((slugs2DArray, i) => {
      const category = categories[i]!;
      const slugMap = new Map(slugs2DArray.map((slugs, j) => [subCategories2DArray[i]![j]!, slugs]));
      return [category, slugMap];
    })
  )
);

export const allSubCategories = subCategories2DArray.flat();

export const allSlugs = slugs3DArray.flat(2);

export const contentStructureMaps = {
  categories,
  subCategoriesMap,
};

export type ContentStructureMaps = typeof contentStructureMaps;
