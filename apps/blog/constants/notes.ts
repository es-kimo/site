import { Category, NoteMetadata, Notes } from "@/constants/notes.types";
import { getFolderNames } from "@/lib/file-system";
import path from "path";

export const CONTENT_PATH = path.join(process.cwd(), "content");

const contentCategories: Category[] = await getFolderNames(CONTENT_PATH);

/** 글 제목 (draft 제외, 이미 디코딩된 params를 받음) */
export const getSlugsByCategory = async (category: Category) => {
  const slugs = await getFolderNames(path.join(CONTENT_PATH, category));

  // draft 상태인 글 필터링
  const publishedSlugs = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const metadata = await getSlugMetadata(category, slug);
        return metadata.other?.status !== "draft" ? slug : null;
      } catch (error) {
        // metadata를 가져올 수 없는 경우 제외
        console.error(`Failed to load metadata for ${category}/${slug}:`, error);
        return null;
      }
    }),
  );

  return publishedSlugs.filter((slug): slug is string => slug !== null);
};

// TODO: metadata의 타입가드 및 불일치시 에러 던지기
/** 글 정보 (이미 디코딩된 params를 받음) */
export const getSlugMetadata = async (category: Category, slug: string): Promise<NoteMetadata> => {
  const { metadata } = await import(`@/content/${category}/${slug}/page.mdx`);
  return metadata;
};

export type NoteItem = {
  category: string;
  slug: string;
};

/** 작성일을 기준으로 최신 글부터 정렬합니다. */
export const sortNotesByLatestDate = async (notes: NoteItem[]): Promise<NoteItem[]> => {
  const notesWithDates = await Promise.all(
    notes.map(async (note) => {
      const metadata = await getSlugMetadata(note.category, note.slug);
      const latestDate = metadata.other.createdAt;

      return { ...note, latestTimestamp: new Date(latestDate).getTime() };
    }),
  );

  return notesWithDates
    .sort(
      (a, b) =>
        b.latestTimestamp - a.latestTimestamp || `${a.category}/${a.slug}`.localeCompare(`${b.category}/${b.slug}`),
    )
    .map(({ category, slug }) => ({ category, slug }));
};

/** draft를 제외한 공개 글 */
export const NOTES: Notes = Object.fromEntries(
  await Promise.all(
    contentCategories.map(async (category) => [category, await getSlugsByCategory(category)] as const),
  ),
);

/** 공개 글이 하나 이상 있는 카테고리 */
export const CATEGORIES: Category[] = Object.entries(NOTES)
  .filter(([, slugs]) => slugs.length > 0)
  .map(([category]) => category);

export type AdjacentNote = NoteItem & { title: string };

/**
 * 같은 카테고리에서 바로 앞뒤에 쓴 글. 정렬이 최신순이라 older가 한 칸 뒤, newer가 한 칸 앞이다.
 * 시리즈가 아닌 글의 푸터에서 다음에 읽을 글을 제안하는 데 쓴다.
 */
export const getAdjacentNotes = async (category: Category, slug: string) => {
  const slugs = NOTES[category] ?? [];
  const sorted = await sortNotesByLatestDate(slugs.map((s) => ({ category, slug: s })));
  const index = sorted.findIndex((note) => note.slug === slug);

  const at = async (position: number): Promise<AdjacentNote | null> => {
    const note = index === -1 ? undefined : sorted[position];
    if (!note) return null;

    const metadata = await getSlugMetadata(note.category, note.slug);
    return { ...note, title: metadata.title?.toString() ?? note.slug };
  };

  return { older: await at(index + 1), newer: await at(index - 1) };
};
