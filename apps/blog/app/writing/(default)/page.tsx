import { NoteCard } from "@/components/note-card";
import { NOTES } from "@/constants/notes";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { AlertCircle } from "lucide-react";

export default function Page() {
  const noteItems = Object.entries(NOTES).flatMap(([category, subCategories]) =>
    Object.entries(subCategories).flatMap(([sub, slugs]) =>
      slugs.map((slug) => (
        <li key={slug} className="w-full">
          <NoteCard category={category} sub={sub} slug={slug}>
            <NoteCard.OpengraphImage category={category} sub={sub} slug={slug} />
          </NoteCard>
        </li>
      ))
    )
  );

  return (
    <article>
      <h3 className="sr-only">아티클</h3>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {noteItems.length === 0 && (
          <li>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>아직 등록한 글이 없어요.</AlertTitle>
              <AlertDescription>곧 새로운 글이 업데이트 될 예정이에요.</AlertDescription>
            </Alert>
          </li>
        )}

        {/* TODO: sort by created date */}
        {noteItems}
      </ul>
    </article>
  );
}
