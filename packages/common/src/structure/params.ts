import { CategoryParams, SlugParams, SubCategoryParams } from "@workspace/common/structure/params.types";
import { categories, slugs3DArray, slugsMap, subCategories2DArray, subCategoriesMap } from "@workspace/common/structure/structure";

export const categoryParams: CategoryParams[] = categories.map((category) => ({
  category,
}));

export const subCategoryParams: SubCategoryParams[] = subCategories2DArray
  .map((subCategories, i) => {
    const category = categories[i]!;
    return subCategories.map((subCategory) => ({ category, subCategory }));
  })
  .flat();

export const slugParams: SlugParams[] = slugs3DArray
  .map((slugs2DArray, i) => {
    const category = categories[i]!;
    return slugs2DArray.map((slugs, j) => {
      const subCategory = subCategories2DArray[i]![j]!;
      return slugs.map((slug) => ({ category, subCategory, slug }));
    });
  })
  .flat(2);

export const getSubCategoryParams = async (category: string): Promise<SubCategoryParams[]> => subCategoriesMap.get(category)?.map((subCategory) => ({ category, subCategory })) ?? [];

export const getSlugParams = async (category: string, subCategory: string): Promise<SlugParams[]> => slugsMap.get(category, subCategory)?.map((slug) => ({ category, subCategory, slug })) ?? [];
