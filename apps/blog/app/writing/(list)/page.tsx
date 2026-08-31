import { NoteGrid } from "@/components/note-grid";
import { NOTES, sortNotesByLatestDate } from "@/constants/notes";

export default async function Page() {
  const notes = Object.entries(NOTES).flatMap(([category, slugs]) => slugs.map((slug) => ({ category, slug })));
  const sortedNotes = await sortNotesByLatestDate(notes);

  return <NoteGrid notes={sortedNotes} />;
}
