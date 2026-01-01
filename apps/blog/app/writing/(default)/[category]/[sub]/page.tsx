import { NoteGrid } from "@/components/note-grid";
import { getSlugsByCategoryAndSub } from "@/constants/notes";
import { SubParams } from "@/constants/params.types";

export default async function Page({ params }: { params: Promise<SubParams> }) {
  const { category, sub } = await params;

  // 특정 서브 카테고리의 글만 가져오기 (draft 제외됨)
  const slugs = await getSlugsByCategoryAndSub(category, sub);
  const notes = slugs.map((slug) => ({ category, sub, slug }));

  return <NoteGrid notes={notes} />;
}
