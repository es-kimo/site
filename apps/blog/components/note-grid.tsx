import { NoteCard } from "@/components/note-card";

type NoteItem = {
  category: string;
  slug: string;
};

type NoteGridProps = {
  notes: NoteItem[];
  headingLevel?: 2 | 3;
};

export function NoteGrid({ notes, headingLevel }: NoteGridProps) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">아직 등록한 글이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col gap-8">
      {notes.map(({ category, slug }) => (
        <li key={`${category}-${slug}`}>
          <NoteCard category={category} slug={slug} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
