import { CATEGORIES, getSubCategoriesByCategory, NOTES } from "@workspace/common/structure/notes";
import { Category } from "@workspace/common/structure/notes.types";
import { CategoryParams, SlugParams, SubParams } from "@workspace/common/structure/params.types";
import { isCategory } from "@workspace/common/lib/type-guards";

export const categoryParams: CategoryParams[] = CATEGORIES.map((category) => ({
  category,
}));

export const getSubParams = async (category: Category): Promise<SubParams[]> => (isCategory(category) ? (await getSubCategoriesByCategory(category)).map((sub) => ({ category, sub })) : []);

export const slugParams: SlugParams[] = Object.entries(NOTES).reduce<{ category: string; sub: string; slug: string }[]>((acc, [category, subs]) => {
  const subParams = Object.entries(subs).reduce<{ sub: string; slug: string }[]>((acc, [sub, slugs]) => {
    return [...acc, ...slugs.map((slug) => ({ sub, slug }))];
  }, []);

  return [...acc, ...subParams.map((subParam) => ({ category, ...subParam }))];
}, []);
