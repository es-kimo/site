import { CATEGORIES, getSubCategoriesByCategory, NOTES } from "@/constants/notes";
import { Category } from "@/constants/notes.types";
import { isCategory } from "@/lib/type-guards";

export const categoryParams = CATEGORIES.map((category) => ({
  category,
}));

export const getSubParams = async (category: Category) => (isCategory(category) ? (await getSubCategoriesByCategory(category)).map((sub) => ({ category, sub })) : []);

export const slugParams = Object.entries(NOTES).reduce<{ category: string; sub: string; slug: string }[]>((acc, [category, subs]) => {
  const subParams = Object.entries(subs).reduce<{ sub: string; slug: string }[]>((acc, [sub, slugs]) => {
    return [...acc, ...slugs.map((slug) => ({ sub, slug }))];
  }, []);

  return [...acc, ...subParams.map((subParam) => ({ category, ...subParam }))];
}, []);
