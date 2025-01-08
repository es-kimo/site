import { categories } from "@/constants/categories";
import { getSlugsByCategoryAndSub } from "@/constants/slugs";
import { getSubCategoriesByCategory } from "@/constants/subCategories";
import { isCategory } from "@/lib/type-guards";

export type Notes = {
  [category: string]: {
    [sub: string]: string[];
  };
};

export const NOTES: Notes = categories.reduce((acc, category) => {
  const subs = isCategory(category) ? getSubCategoriesByCategory(category) : [];
  const slugs = subs.reduce(
    (acc, sub) => ({
      ...acc,
      [sub]: isCategory(category) ? getSlugsByCategoryAndSub(category, sub) : [],
    }),
    {}
  );
  return { ...acc, [category]: slugs };
}, {});
