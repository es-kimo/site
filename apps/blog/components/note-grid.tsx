import { NoteCard } from "@/components/note-card";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { AlertCircle } from "lucide-react";

type NoteItem = {
  category: string;
  sub: string;
  slug: string;
};

type NoteGridProps = {
  notes: NoteItem[];
};

export function NoteGrid({ notes }: NoteGridProps) {
  return (
    <article>
      <h3 className="sr-only">아티클</h3>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.length === 0 && (
          <li>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>아직 등록한 글이 없어요.</AlertTitle>
              <AlertDescription>곧 새로운 글이 업데이트 될 예정이에요.</AlertDescription>
            </Alert>
          </li>
        )}

        {/* TODO: sort by created date */}
        {notes.map(({ category, sub, slug }) => (
          <li key={`${category}-${sub}-${slug}`} className="w-full">
            <NoteCard category={category} sub={sub} slug={slug}>
              <NoteCard.OpengraphImage category={category} sub={sub} slug={slug} />
            </NoteCard>
          </li>
        ))}
      </ul>
    </article>
  );
}
