import { NoteGrid } from "@/components/note-grid";
import { getSlugsByCategoryAndSub, getSubCategoriesByCategory, NOTES } from "@/constants/notes";
import { CategoryParams } from "@/constants/params.types";
import { decodeURIS } from "@workspace/common/lib/uri";

export default async function Page({ params }: { params: Promise<CategoryParams> }) {
  const { category } = await params;
  const [decodedCategory] = decodeURIS(category);

  // draft 제외된 NOTES를 활용하여 실제 글이 있는 서브 카테고리만 필터링
  const allSubs = await getSubCategoriesByCategory(decodedCategory);
  const subs = allSubs.filter((s) => (NOTES[decodedCategory]?.[s]?.length ?? 0) > 0);

  const notes = await Promise.all(
    subs.map(async (sub) => {
      const slugs = await getSlugsByCategoryAndSub(decodedCategory, sub);
      return slugs.map((slug) => ({ category: decodedCategory, sub, slug }));
    })
  ).then((results) => results.flat());

  return <NoteGrid notes={notes} />;
}
