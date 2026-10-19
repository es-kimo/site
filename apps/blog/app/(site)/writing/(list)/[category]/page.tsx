import { NoteGrid } from "@/components/note-grid";
import { listNotes } from "@/constants/notes";
import { categoryParams } from "@/constants/params";
import { CategoryParams } from "@/constants/params.types";
import { formatCategoryLabel } from "@/lib/category";
import { decodeURIS } from "@workspace/common/lib/uri";
import { Metadata } from "next";

/** route group이 달라서 부모로부터 static param을 받을 수 없음 */
export function generateStaticParams() {
  return categoryParams;
}

/** 공개 글이 있는 카테고리 밖의 주소는 라우팅 단계에서 404가 된다 */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<CategoryParams> }): Promise<Metadata> {
  const { category } = await params;
  const [decodedCategory] = decodeURIS(category);

  return {
    title: `Writing | ${formatCategoryLabel(decodedCategory)}`,
  };
}

export default async function Page({ params }: { params: Promise<CategoryParams> }) {
  const { category } = await params;
  const [decodedCategory] = decodeURIS(category);

  return <NoteGrid notes={await listNotes(decodedCategory)} />;
}
