import { CATEGORIES, NOTES } from "@/constants/notes";
import { CategoryParams, SlugParams } from "@/constants/params.types";

export const categoryParams: CategoryParams[] = CATEGORIES.map((category) => ({
  category,
}));

export const slugParams: SlugParams[] = Object.entries(NOTES).reduce<SlugParams[]>((acc, [category, slugs]) => {
  return [...acc, ...slugs.map((slug) => ({ category, slug }))];
}, []);
