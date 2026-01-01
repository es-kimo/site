import { NoteGrid } from "@/components/note-grid";
import { getSlugsByCategoryAndSub } from "@/constants/notes";
import { SubParams } from "@/constants/params.types";
import { decodeURIS } from "@workspace/common/lib/uri";

export default async function Page({ params }: { params: Promise<SubParams> }) {
  const { category, sub } = await params;
  const [decodedCategory, decodedSub] = decodeURIS(category, sub);

  // 특정 서브 카테고리의 글만 가져오기 (draft 제외됨)
  const slugs = await getSlugsByCategoryAndSub(decodedCategory, decodedSub);
  const notes = slugs.map((slug) => ({ category: decodedCategory, sub: decodedSub, slug }));

  return <NoteGrid notes={notes} />;
}
