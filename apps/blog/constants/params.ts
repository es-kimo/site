import { NOTES } from "@/constants/notes";

export const slugParams = Object.entries(NOTES).reduce<{ category: string; sub: string; slug: string }[]>((acc, [category, subs]) => {
  const subParams = Object.entries(subs).reduce<{ sub: string; slug: string }[]>((acc, [sub, slugs]) => {
    return [...acc, ...slugs.map((slug) => ({ sub, slug }))];
  }, []);

  return [...acc, ...subParams.map((subParam) => ({ category, ...subParam }))];
}, []);
