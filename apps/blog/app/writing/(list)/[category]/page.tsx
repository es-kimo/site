import { NoteGrid } from "@/components/note-grid";
import { getSlugsByCategory, NOTES } from "@/constants/notes";
import { CategoryParams } from "@/constants/params.types";
import { decodeURIS } from "@workspace/common/lib/uri";

export default async function Page({ params }: { params: Promise<CategoryParams> }) {
  const { category } = await params;
  const [decodedCategory] = decodeURIS(category);

  // draft 제외된 NOTES를 활용하여 글 목록 가져오기
  const slugs = await getSlugsByCategory(decodedCategory);
  const notes = slugs.map((slug) => ({ category: decodedCategory, slug }));

  return <NoteGrid notes={notes} />;
}
