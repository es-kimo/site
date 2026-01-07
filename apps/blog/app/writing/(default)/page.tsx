import { NoteGrid } from "@/components/note-grid";
import { NOTES } from "@/constants/notes";

export default function Page() {
  const notes = Object.entries(NOTES).flatMap(([category, slugs]) => slugs.map((slug) => ({ category, slug })));

  return <NoteGrid notes={notes} />;
}
