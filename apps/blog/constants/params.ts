import { CATEGORIES, getSubCategoriesByCategory, NOTES } from "@/constants/notes";
import { Category } from "@/constants/notes.types";
import { CategoryParams, SlugParams, SubParams } from "@/constants/params.types";
import { isCategory } from "@/lib/type-guards";

export const categoryParams: CategoryParams[] = CATEGORIES.map((category) => ({
  category,
}));

export const getSubParams = async (category: Category): Promise<SubParams[]> => (isCategory(category) ? (await getSubCategoriesByCategory(category)).map((sub) => ({ category, sub })) : []);

export const slugParams: SlugParams[] = Object.entries(NOTES).reduce<SlugParams[]>((acc, [category, subs]) => {
  const subParams = Object.entries(subs).reduce<{ sub: string; slug: string }[]>((acc, [sub, slugs]) => {
    return [...acc, ...slugs.map((slug) => ({ sub, slug }))];
  }, []);

  return [...acc, ...subParams.map((subParam) => ({ category, ...subParam }))];
}, []);
